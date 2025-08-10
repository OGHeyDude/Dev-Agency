#!/usr/bin/env node
/**
 * TypeScript/JavaScript Parser for Memory Sync Agent
 * Parses TS/JS files into semantic chunks with relationship extraction
 */

const ts = require('typescript');
const fs = require('fs');
const path = require('path');

/**
 * Represents a code entity for the knowledge graph
 */
class Entity {
    constructor(name, entityType, filePath, observations, lineStart = null, lineEnd = null) {
        this.name = name;
        this.entity_type = entityType;
        this.file_path = filePath;
        this.observations = observations;
        if (lineStart !== null) this.line_start = lineStart;
        if (lineEnd !== null) this.line_end = lineEnd;
    }

    toDict() {
        const result = {
            name: this.name,
            entity_type: this.entity_type,
            file_path: this.file_path,
            observations: this.observations
        };
        if (this.line_start !== undefined) result.line_start = this.line_start;
        if (this.line_end !== undefined) result.line_end = this.line_end;
        return result;
    }
}

/**
 * Represents a relationship between entities
 */
class Relation {
    constructor(fromEntity, toEntity, relationType) {
        this.from_entity = fromEntity;
        this.to_entity = toEntity;
        this.relation_type = relationType;
    }

    toDict() {
        return {
            from_entity: this.from_entity,
            to_entity: this.to_entity,
            relation_type: this.relation_type
        };
    }
}

/**
 * Parser for TypeScript/JavaScript code files
 */
class TypeScriptParser {
    constructor() {
        this.entities = [];
        this.relations = [];
        this.imports = new Map();
        this.exports = new Map();
        this.sourceFile = null;
        this.filePath = '';
    }

    /**
     * Parse TypeScript/JavaScript file into entities and relations
     */
    parseFile(filePath) {
        this.entities = [];
        this.relations = [];
        this.imports = new Map();
        this.exports = new Map();
        this.filePath = filePath;

        let source;
        try {
            source = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            return { entities: [], relations: [] };
        }

        // Determine file type and create appropriate parser options
        const isTypeScript = path.extname(filePath).match(/\.(ts|tsx)$/);
        const isReact = path.extname(filePath).match(/\.(tsx|jsx)$/);
        
        const compilerOptions = {
            target: ts.ScriptTarget.Latest,
            module: ts.ModuleKind.CommonJS,
            allowJs: true,
            jsx: isReact ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
            strict: false,
            skipLibCheck: true
        };

        try {
            this.sourceFile = ts.createSourceFile(
                path.basename(filePath),
                source,
                ts.ScriptTarget.Latest,
                true,
                isTypeScript ? ts.ScriptKind.TS : ts.ScriptKind.JS
            );
        } catch (error) {
            // If parsing fails, create a simple file entity
            return { 
                entities: this._createFileEntity(filePath, source).map(e => e.toDict()), 
                relations: [] 
            };
        }

        // Extract imports and exports first
        this._extractImportsAndExports(this.sourceFile);

        // Process the AST
        this._processNode(this.sourceFile, filePath);

        return {
            entities: this.entities.map(e => e.toDict()),
            relations: this.relations.map(r => r.toDict())
        };
    }

    /**
     * Create a simple file entity when parsing fails
     */
    _createFileEntity(filePath, source) {
        const fileName = path.basename(filePath, path.extname(filePath));
        const lines = source.split('\n');
        const ext = path.extname(filePath);
        
        const observations = [
            `${ext.substring(1).toUpperCase()} file with ${lines.length} lines`,
            "Could not parse AST - may contain syntax errors"
        ];

        // Try to extract JSDoc or leading comment
        const docComment = this._extractLeadingComment(source);
        if (docComment) {
            observations.push(`Purpose: ${docComment.substring(0, 200)}`);
        }

        // Detect if it's likely a React component
        if (source.includes('React') || source.includes('jsx') || source.includes('tsx')) {
            observations.push("Likely React component file");
        }

        return [new Entity(
            fileName,
            this._getFileEntityType(filePath, source),
            filePath,
            observations
        )];
    }

    /**
     * Extract leading comment or JSDoc
     */
    _extractLeadingComment(source) {
        const lines = source.split('\n');
        let comment = '';
        let inBlockComment = false;
        
        for (const line of lines.slice(0, 10)) {
            const trimmed = line.trim();
            if (trimmed.startsWith('/**')) {
                inBlockComment = true;
                comment += trimmed.replace(/^\/\*\*\s?/, '');
            } else if (trimmed.startsWith('*') && inBlockComment) {
                comment += ' ' + trimmed.replace(/^\*\s?/, '');
            } else if (trimmed.endsWith('*/') && inBlockComment) {
                comment += ' ' + trimmed.replace(/\*\/\s?$/, '');
                break;
            } else if (trimmed.startsWith('//')) {
                comment += ' ' + trimmed.replace(/^\/\/\s?/, '');
            } else if (trimmed && !inBlockComment) {
                break;
            }
        }
        
        return comment.trim();
    }

    /**
     * Determine file entity type based on content and name
     */
    _getFileEntityType(filePath, source) {
        const fileName = path.basename(filePath).toLowerCase();
        const ext = path.extname(filePath);
        
        if (ext.match(/\.(tsx|jsx)$/)) {
            return "ReactComponent";
        }
        if (fileName.includes('test') || fileName.includes('spec')) {
            return "TestFile";
        }
        if (fileName.includes('config')) {
            return "ConfigFile";
        }
        if (fileName.includes('type') || fileName.includes('interface')) {
            return "TypeDefinition";
        }
        if (ext === '.ts') {
            return "TypeScriptFile";
        }
        if (ext === '.js') {
            return "JavaScriptFile";
        }
        return "JSFile";
    }

    /**
     * Extract all imports and exports from the module
     */
    _extractImportsAndExports(node) {
        const visit = (node) => {
            if (ts.isImportDeclaration(node)) {
                this._processImportDeclaration(node);
            } else if (ts.isExportDeclaration(node)) {
                this._processExportDeclaration(node);
            } else if (ts.isExportAssignment(node)) {
                this._processExportAssignment(node);
            }
            
            ts.forEachChild(node, visit);
        };
        
        visit(node);
    }

    /**
     * Process import declaration
     */
    _processImportDeclaration(node) {
        if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
            return;
        }
        
        const moduleName = node.moduleSpecifier.text;
        
        if (node.importClause) {
            // Default import
            if (node.importClause.name) {
                const importName = node.importClause.name.text;
                this.imports.set(importName, moduleName);
            }
            
            // Named imports
            if (node.importClause.namedBindings) {
                if (ts.isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach(element => {
                        const importName = element.name.text;
                        const originalName = element.propertyName ? element.propertyName.text : importName;
                        this.imports.set(importName, `${moduleName}.${originalName}`);
                    });
                } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
                    // import * as name
                    const namespaceName = node.importClause.namedBindings.name.text;
                    this.imports.set(namespaceName, moduleName);
                }
            }
        }
    }

    /**
     * Process export declaration
     */
    _processExportDeclaration(node) {
        if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            node.exportClause.elements.forEach(element => {
                const exportName = element.name.text;
                this.exports.set(exportName, true);
            });
        }
    }

    /**
     * Process export assignment
     */
    _processExportAssignment(node) {
        if (ts.isIdentifier(node.expression)) {
            this.exports.set(node.expression.text, true);
        }
    }

    /**
     * Process AST nodes to extract entities
     */
    _processNode(sourceFile, filePath) {
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Count different types of declarations
        const classes = [];
        const interfaces = [];
        const types = [];
        const functions = [];
        const components = [];
        
        this._collectDeclarations(sourceFile, classes, interfaces, types, functions, components);
        
        // Determine file complexity and processing strategy
        const totalDeclarations = classes.length + interfaces.length + types.length + functions.length + components.length;
        
        if (totalDeclarations > 5 || classes.length > 2) {
            // Complex file - use fine-grained entities
            this._processComplexFile(sourceFile, filePath, classes, interfaces, types, functions, components);
        } else {
            // Simple file - use coarse-grained entities
            this._processSimpleFile(sourceFile, filePath, classes, interfaces, types, functions, components);
        }
    }

    /**
     * Collect all declarations from the source file
     */
    _collectDeclarations(node, classes, interfaces, types, functions, components) {
        const visit = (node) => {
            if (ts.isClassDeclaration(node)) {
                classes.push(node);
            } else if (ts.isInterfaceDeclaration(node)) {
                interfaces.push(node);
            } else if (ts.isTypeAliasDeclaration(node)) {
                types.push(node);
            } else if (ts.isFunctionDeclaration(node)) {
                functions.push(node);
            } else if (ts.isVariableStatement(node)) {
                // Check for React components or arrow functions
                node.declarationList.declarations.forEach(decl => {
                    if (this._isReactComponent(decl) || this._isArrowFunction(decl)) {
                        if (this._isReactComponent(decl)) {
                            components.push(decl);
                        } else {
                            functions.push(decl);
                        }
                    }
                });
            }
            
            ts.forEachChild(node, visit);
        };
        
        visit(node);
    }

    /**
     * Check if a variable declaration is a React component
     */
    _isReactComponent(decl) {
        if (!decl.name || !ts.isIdentifier(decl.name)) return false;
        
        const name = decl.name.text;
        // React components start with uppercase
        if (!/^[A-Z]/.test(name)) return false;
        
        if (decl.initializer) {
            // Arrow function component
            if (ts.isArrowFunction(decl.initializer)) {
                return this._containsJSX(decl.initializer) || this._hasReactTypes(decl);
            }
            // Function expression component
            if (ts.isFunctionExpression(decl.initializer)) {
                return this._containsJSX(decl.initializer) || this._hasReactTypes(decl);
            }
        }
        
        return false;
    }

    /**
     * Check if a variable declaration is an arrow function
     */
    _isArrowFunction(decl) {
        return decl.initializer && ts.isArrowFunction(decl.initializer);
    }

    /**
     * Check if node contains JSX
     */
    _containsJSX(node) {
        let hasJSX = false;
        const visit = (n) => {
            if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) {
                hasJSX = true;
                return;
            }
            ts.forEachChild(n, visit);
        };
        visit(node);
        return hasJSX;
    }

    /**
     * Check if declaration has React-related types
     */
    _hasReactTypes(decl) {
        if (decl.type) {
            const typeText = decl.type.getText();
            return typeText.includes('React') || typeText.includes('JSX') || typeText.includes('FC') || typeText.includes('FunctionComponent');
        }
        return false;
    }

    /**
     * Process simple file as a single or few entities
     */
    _processSimpleFile(sourceFile, filePath, classes, interfaces, types, functions, components) {
        const fileName = path.basename(filePath, path.extname(filePath));
        
        const observations = [];
        
        // Add file purpose if available
        const leadingComment = this._extractLeadingComment(sourceFile.getFullText());
        if (leadingComment) {
            observations.push(leadingComment.substring(0, 200));
        }
        
        // Add component information
        if (components.length > 0) {
            const componentNames = components.map(c => c.name?.text || 'Anonymous').slice(0, 5);
            observations.push(`React Components: ${componentNames.join(', ')}`);
        }
        
        // Add class information
        if (classes.length > 0) {
            const classNames = classes.map(c => c.name?.text || 'Anonymous').slice(0, 5);
            observations.push(`Classes: ${classNames.join(', ')}`);
        }
        
        // Add interface information
        if (interfaces.length > 0) {
            const interfaceNames = interfaces.map(i => i.name?.text || 'Anonymous').slice(0, 5);
            observations.push(`Interfaces: ${interfaceNames.join(', ')}`);
        }
        
        // Add type information
        if (types.length > 0) {
            const typeNames = types.map(t => t.name?.text || 'Anonymous').slice(0, 5);
            observations.push(`Types: ${typeNames.join(', ')}`);
        }
        
        // Add function information
        if (functions.length > 0) {
            const functionNames = functions.map(f => {
                if (ts.isFunctionDeclaration(f)) {
                    return f.name?.text || 'Anonymous';
                } else if (ts.isVariableDeclaration(f)) {
                    return f.name?.text || 'Anonymous';
                }
                return 'Anonymous';
            }).slice(0, 5);
            observations.push(`Functions: ${functionNames.join(', ')}`);
        }
        
        // Add import information
        if (this.imports.size > 0) {
            const keyImports = Array.from(this.imports.values()).slice(0, 5);
            observations.push(`Imports: ${keyImports.join(', ')}`);
        }
        
        // Determine entity type
        let entityType = this._getFileEntityType(filePath, sourceFile.getFullText());
        if (components.length > 0) {
            entityType = "ReactModule";
        } else if (interfaces.length > types.length && interfaces.length > classes.length) {
            entityType = "TypeDefinition";
        } else if (classes.length > 0) {
            entityType = "ClassModule";
        }
        
        const moduleEntity = new Entity(
            fileName,
            entityType,
            filePath,
            observations
        );
        this.entities.push(moduleEntity);
        
        // Create relationships for imports
        this._createImportRelationships(fileName);
    }

    /**
     * Process complex file with fine-grained entities
     */
    _processComplexFile(sourceFile, filePath, classes, interfaces, types, functions, components) {
        const fileName = path.basename(filePath, path.extname(filePath));
        
        // Process classes
        classes.forEach(classNode => {
            this._processClass(classNode, filePath);
        });
        
        // Process interfaces
        interfaces.forEach(interfaceNode => {
            this._processInterface(interfaceNode, filePath);
        });
        
        // Process type aliases
        types.forEach(typeNode => {
            this._processTypeAlias(typeNode, filePath);
        });
        
        // Process React components
        components.forEach(componentNode => {
            this._processReactComponent(componentNode, filePath);
        });
        
        // Process functions
        functions.forEach(functionNode => {
            this._processFunction(functionNode, filePath, fileName);
        });
        
        // Create import relationships  
        this._createImportRelationships(fileName);
        
        // Add relationships for export usage
        this._createExportRelationships(fileName);
    }

    /**
     * Process a class declaration
     */
    _processClass(node, filePath) {
        if (!node.name) return;
        
        const className = node.name.text;
        
        // Extract JSDoc comment
        const jsDoc = this._getJSDocComment(node);
        
        // Get class information
        const methods = [];
        const properties = [];
        const accessors = [];
        
        node.members?.forEach(member => {
            if (ts.isMethodDeclaration(member) && member.name) {
                methods.push({
                    name: member.name.getText(),
                    isAsync: !!(member.modifiers && member.modifiers.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword)),
                    isStatic: !!(member.modifiers && member.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword)),
                    visibility: this._getVisibility(member.modifiers)
                });
            } else if (ts.isPropertyDeclaration(member) && member.name) {
                properties.push({
                    name: member.name.getText(),
                    isStatic: !!(member.modifiers && member.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword)),
                    visibility: this._getVisibility(member.modifiers)
                });
            } else if ((ts.isGetAccessorDeclaration(member) || ts.isSetAccessorDeclaration(member)) && member.name) {
                accessors.push({
                    name: member.name.getText(),
                    type: ts.isGetAccessorDeclaration(member) ? 'getter' : 'setter'
                });
            }
        });
        
        // Get inheritance information
        const baseClasses = [];
        const implementedInterfaces = [];
        
        if (node.heritageClauses) {
            node.heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    const typeName = type.expression.getText();
                    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                        baseClasses.push(typeName);
                    } else if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
                        implementedInterfaces.push(typeName);
                    }
                });
            });
        }
        
        // Create observations
        const observations = [];
        if (jsDoc) {
            observations.push(jsDoc.substring(0, 200));
        }
        
        if (baseClasses.length > 0) {
            observations.push(`Extends: ${baseClasses.join(', ')}`);
        }
        
        if (implementedInterfaces.length > 0) {
            observations.push(`Implements: ${implementedInterfaces.join(', ')}`);
        }
        
        if (methods.length > 0) {
            const methodNames = methods.map(m => m.name).slice(0, 10);
            observations.push(`Methods: ${methodNames.join(', ')}`);
            if (methods.length > 10) {
                observations.push(`... and ${methods.length - 10} more methods`);
            }
        }
        
        if (properties.length > 0) {
            const propNames = properties.map(p => p.name).slice(0, 10);
            observations.push(`Properties: ${propNames.join(', ')}`);
        }
        
        if (accessors.length > 0) {
            observations.push(`Accessors: ${accessors.map(a => `${a.name} (${a.type})`).join(', ')}`);
        }
        
        const entity = new Entity(
            className,
            "TypeScriptClass",
            filePath,
            observations,
            this._getLineNumber(node),
            this._getEndLineNumber(node)
        );
        this.entities.push(entity);
        
        // Create inheritance relationships
        baseClasses.forEach(baseClass => {
            this.relations.push(new Relation(className, baseClass, "extends"));
        });
        
        implementedInterfaces.forEach(interfaceName => {
            this.relations.push(new Relation(className, interfaceName, "implements"));
        });
    }

    /**
     * Process an interface declaration
     */
    _processInterface(node, filePath) {
        if (!node.name) return;
        
        const interfaceName = node.name.text;
        const jsDoc = this._getJSDocComment(node);
        
        // Get interface members
        const properties = [];
        const methods = [];
        
        node.members?.forEach(member => {
            if (ts.isPropertySignature(member) && member.name) {
                const propName = member.name.getText();
                const isOptional = !!member.questionToken;
                const typeInfo = member.type ? this._getTypeString(member.type) : 'any';
                properties.push({ name: propName, type: typeInfo, optional: isOptional });
            } else if (ts.isMethodSignature(member) && member.name) {
                const methodName = member.name.getText();
                methods.push({ name: methodName });
            }
        });
        
        // Get extended interfaces
        const extendedInterfaces = [];
        if (node.heritageClauses) {
            node.heritageClauses.forEach(clause => {
                clause.types.forEach(type => {
                    extendedInterfaces.push(type.expression.getText());
                });
            });
        }
        
        // Create observations
        const observations = [];
        if (jsDoc) {
            observations.push(jsDoc.substring(0, 200));
        }
        
        if (extendedInterfaces.length > 0) {
            observations.push(`Extends: ${extendedInterfaces.join(', ')}`);
        }
        
        if (properties.length > 0) {
            const propDescriptions = properties.slice(0, 5).map(p => 
                `${p.name}${p.optional ? '?' : ''}: ${p.type}`
            );
            observations.push(`Properties: ${propDescriptions.join(', ')}`);
            if (properties.length > 5) {
                observations.push(`... and ${properties.length - 5} more properties`);
            }
        }
        
        if (methods.length > 0) {
            const methodNames = methods.map(m => m.name);
            observations.push(`Methods: ${methodNames.join(', ')}`);
        }
        
        const entity = new Entity(
            interfaceName,
            "TypeScriptInterface",
            filePath,
            observations,
            this._getLineNumber(node),
            this._getEndLineNumber(node)
        );
        this.entities.push(entity);
        
        // Create extension relationships
        extendedInterfaces.forEach(extendedInterface => {
            this.relations.push(new Relation(interfaceName, extendedInterface, "extends"));
        });
    }

    /**
     * Process a type alias declaration
     */
    _processTypeAlias(node, filePath) {
        if (!node.name) return;
        
        const typeName = node.name.text;
        const jsDoc = this._getJSDocComment(node);
        const typeDefinition = this._getTypeString(node.type);
        
        const observations = [];
        if (jsDoc) {
            observations.push(jsDoc.substring(0, 200));
        }
        
        observations.push(`Type definition: ${typeDefinition.substring(0, 100)}`);
        
        // Check if it's a union type
        if (ts.isUnionTypeNode(node.type)) {
            const unionTypes = node.type.types.map(t => this._getTypeString(t));
            observations.push(`Union of: ${unionTypes.join(' | ')}`);
        }
        
        const entity = new Entity(
            typeName,
            "TypeScriptType",
            filePath,
            observations,
            this._getLineNumber(node),
            this._getEndLineNumber(node)
        );
        this.entities.push(entity);
    }

    /**
     * Process a React component
     */
    _processReactComponent(node, filePath) {
        if (!node.name || !ts.isIdentifier(node.name)) return;
        
        const componentName = node.name.text;
        
        // Get JSDoc or leading comment
        const jsDoc = this._getJSDocComment(node);
        
        // Analyze the component function
        let props = [];
        let hooks = [];
        let returnType = 'JSX.Element';
        
        if (node.initializer) {
            if (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer)) {
                const func = node.initializer;
                
                // Extract props from parameters
                if (func.parameters && func.parameters.length > 0) {
                    const propsParam = func.parameters[0];
                    if (propsParam.type) {
                        props = this._extractPropsFromType(propsParam.type);
                    }
                }
                
                // Extract hooks usage
                hooks = this._extractHooksUsage(func.body);
                
                // Get return type
                if (func.type) {
                    returnType = this._getTypeString(func.type);
                }
            }
        }
        
        // Create observations
        const observations = [];
        if (jsDoc) {
            observations.push(jsDoc.substring(0, 200));
        } else {
            observations.push(`React functional component`);
        }
        
        if (props.length > 0) {
            observations.push(`Props: ${props.slice(0, 5).join(', ')}`);
            if (props.length > 5) {
                observations.push(`... and ${props.length - 5} more props`);
            }
        }
        
        if (hooks.length > 0) {
            observations.push(`Hooks used: ${[...new Set(hooks)].join(', ')}`);
        }
        
        observations.push(`Returns: ${returnType}`);
        
        const entity = new Entity(
            componentName,
            "ReactComponent",
            filePath,
            observations,
            this._getLineNumber(node),
            this._getEndLineNumber(node)
        );
        this.entities.push(entity);
    }

    /**
     * Process a function declaration or arrow function
     */
    _processFunction(node, filePath, moduleName) {
        let functionName, funcNode;
        
        if (ts.isFunctionDeclaration(node)) {
            functionName = node.name ? node.name.text : 'anonymous';
            funcNode = node;
        } else if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
            functionName = node.name.text;
            funcNode = node.initializer;
        } else {
            return;
        }
        
        const fullName = `${moduleName}.${functionName}`;
        
        // Get JSDoc comment
        const jsDoc = this._getJSDocComment(node);
        
        // Get function signature information
        const params = [];
        const isAsync = !!(funcNode?.modifiers && funcNode.modifiers.some(mod => mod.kind === ts.SyntaxKind.AsyncKeyword));
        let returnType = 'void';
        
        if (funcNode && (ts.isFunctionDeclaration(funcNode) || ts.isArrowFunction(funcNode) || ts.isFunctionExpression(funcNode))) {
            // Extract parameters
            if (funcNode.parameters) {
                funcNode.parameters.forEach(param => {
                    if (param.name && ts.isIdentifier(param.name)) {
                        const paramName = param.name.text;
                        const isOptional = !!param.questionToken;
                        const paramType = param.type ? this._getTypeString(param.type) : 'any';
                        params.push(`${paramName}${isOptional ? '?' : ''}: ${paramType}`);
                    }
                });
            }
            
            // Extract return type
            if (funcNode.type) {
                returnType = this._getTypeString(funcNode.type);
            }
        }
        
        // Create observations
        const observations = [];
        if (jsDoc) {
            observations.push(jsDoc.substring(0, 200));
        }
        
        observations.push(`Parameters: ${params.length > 0 ? params.join(', ') : 'none'}`);
        observations.push(`Returns: ${returnType}`);
        
        if (isAsync) {
            observations.push("Async function");
        }
        
        const entity = new Entity(
            fullName,
            "TypeScriptFunction",
            filePath,
            observations,
            this._getLineNumber(node),
            this._getEndLineNumber(node)
        );
        this.entities.push(entity);
    }

    /**
     * Extract props from TypeScript type annotation
     */
    _extractPropsFromType(typeNode) {
        const props = [];
        
        if (ts.isTypeLiteralNode(typeNode)) {
            typeNode.members.forEach(member => {
                if (ts.isPropertySignature(member) && member.name) {
                    const propName = member.name.getText();
                    const isOptional = !!member.questionToken;
                    props.push(`${propName}${isOptional ? '?' : ''}`);
                }
            });
        } else if (ts.isTypeReferenceNode(typeNode)) {
            // Reference to an interface or type
            const typeName = typeNode.typeName.getText();
            props.push(`{${typeName}}`);
        }
        
        return props;
    }

    /**
     * Extract hooks usage from function body
     */
    _extractHooksUsage(body) {
        const hooks = [];
        
        if (!body) return hooks;
        
        const visit = (node) => {
            if (ts.isCallExpression(node)) {
                const expression = node.expression;
                if (ts.isIdentifier(expression)) {
                    const name = expression.text;
                    if (name.startsWith('use') && name.length > 3) {
                        hooks.push(name);
                    }
                }
            }
            ts.forEachChild(node, visit);
        };
        
        visit(body);
        return hooks;
    }

    /**
     * Create import relationships
     */
    _createImportRelationships(fileName) {
        const processedModules = new Set();
        
        this.imports.forEach((fullImport, localName) => {
            let baseModule = fullImport;
            
            // For relative imports, extract the module name
            if (baseModule.startsWith('./') || baseModule.startsWith('../')) {
                const parts = baseModule.split('/');
                baseModule = parts[parts.length - 1].replace('.', '_');
                if (baseModule.includes('.')) {
                    baseModule = baseModule.split('.')[0];
                }
            } else {
                baseModule = fullImport.split('.')[0];
            }
            
            // Skip built-in modules and already processed modules
            if (this._isBuiltinModule(fullImport) || processedModules.has(baseModule)) {
                return;
            }
            
            processedModules.add(baseModule);
            this.relations.push(new Relation(fileName, baseModule, "imports"));
        });
    }

    /**
     * Create export relationships
     */
    _createExportRelationships(fileName) {
        // This would be used by other modules importing from this file
        // For now, we just track that exports exist
        if (this.exports.size > 0) {
            // Could add relationships to modules that import from this file
            // This would require cross-file analysis which is beyond current scope
        }
    }

    /**
     * Check if module is a built-in or external module
     */
    _isBuiltinModule(moduleName) {
        // External packages (npm packages)
        if (moduleName.startsWith('@') || (!moduleName.startsWith('.') && !moduleName.startsWith('/'))) {
            return true;
        }
        
        // Common built-in modules
        const builtins = [
            'react', 'react-dom', 'react-native', 'vue', 'angular',
            'typescript', 'node', 'fs', 'path', 'util', 'events',
            'express', 'lodash', 'axios', 'rxjs', 'moment'
        ];
        
        return builtins.includes(moduleName);
    }

    /**
     * Get JSDoc comment for a node
     */
    _getJSDocComment(node) {
        const sourceFile = node.getSourceFile();
        if (!sourceFile) return null;
        
        const fullText = sourceFile.getFullText();
        const nodeStart = node.getFullStart();
        
        // Look for JSDoc comment before the node
        const leadingTriviaWidth = node.getLeadingTriviaWidth();
        const leadingTrivia = fullText.substring(nodeStart, nodeStart + leadingTriviaWidth);
        
        const jsDocMatch = leadingTrivia.match(/\/\*\*(.*?)\*\//s);
        if (jsDocMatch) {
            return jsDocMatch[1]
                .split('\n')
                .map(line => line.replace(/^\s*\*\s?/, ''))
                .join(' ')
                .trim();
        }
        
        return null;
    }

    /**
     * Get visibility modifier
     */
    _getVisibility(modifiers) {
        if (!modifiers) return 'public';
        
        for (const modifier of modifiers) {
            if (modifier.kind === ts.SyntaxKind.PrivateKeyword) return 'private';
            if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) return 'protected';
            if (modifier.kind === ts.SyntaxKind.PublicKeyword) return 'public';
        }
        
        return 'public';
    }

    /**
     * Get string representation of a type
     */
    _getTypeString(typeNode) {
        if (!typeNode) return 'any';
        
        // Handle keyword types (string, number, boolean, etc.)
        switch (typeNode.kind) {
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            case ts.SyntaxKind.VoidKeyword:
                return 'void';
            case ts.SyntaxKind.AnyKeyword:
                return 'any';
            case ts.SyntaxKind.UnknownKeyword:
                return 'unknown';
            case ts.SyntaxKind.NeverKeyword:
                return 'never';
            case ts.SyntaxKind.UndefinedKeyword:
                return 'undefined';
            case ts.SyntaxKind.NullKeyword:
                return 'null';
        }
        
        if (ts.isTypeReferenceNode(typeNode)) {
            const typeName = typeNode.typeName.getText();
            if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
                const typeArgs = typeNode.typeArguments.map(arg => this._getTypeString(arg));
                return `${typeName}<${typeArgs.join(', ')}>`;
            }
            return typeName;
        }
        
        if (ts.isArrayTypeNode(typeNode)) {
            return `${this._getTypeString(typeNode.elementType)}[]`;
        }
        
        if (ts.isUnionTypeNode(typeNode)) {
            return typeNode.types.map(t => this._getTypeString(t)).join(' | ');
        }
        
        if (ts.isLiteralTypeNode(typeNode)) {
            return typeNode.literal.getText();
        }
        
        return typeNode.getText() || 'unknown';
    }

    /**
     * Get line number from node
     */
    _getLineNumber(node) {
        if (!this.sourceFile) return null;
        const start = node.getStart(this.sourceFile);
        return this.sourceFile.getLineAndCharacterOfPosition(start).line + 1;
    }

    /**
     * Get end line number from node
     */
    _getEndLineNumber(node) {
        if (!this.sourceFile) return null;
        const end = node.getEnd();
        return this.sourceFile.getLineAndCharacterOfPosition(end).line + 1;
    }
}

/**
 * Main CLI interface
 */
function main() {
    if (process.argv.length < 3) {
        console.error("Usage: node ts_parser.js <file_path>");
        process.exit(1);
    }

    const filePath = process.argv[2];
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    const parser = new TypeScriptParser();
    
    try {
        const result = parser.parseFile(filePath);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error(`Error parsing file: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { TypeScriptParser, Entity, Relation };