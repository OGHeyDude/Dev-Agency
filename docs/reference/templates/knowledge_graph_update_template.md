# Knowledge Graph Update Template

**Update ID:** KG-[TICKET-XXX]  
**Date:** [Run: date +"%Y-%m-%d %H:%M"]  
**Agent:** [Agent name]  
**Related Ticket:** [STAD-XXX]  
**Update Type:** [Create/Update/Delete/Relation]

---

## 📊 Update Summary

**Entities Modified:** [Count]  
**Relations Modified:** [Count]  
**Observations Added:** [Count]  
**Graph Sections Affected:** [List main areas]

---

## 🔵 Entity Updates

### Created Entities

#### Entity: [Name]
```javascript
mcp__memory__create_entities({
  entities: [{
    name: "[Entity Name]",
    entityType: "[Type: Component/Module/Service/Feature]",
    observations: [
      "[Key characteristic 1]",
      "[Key characteristic 2]",
      "[Implementation detail]"
    ]
  }]
})
```
**Rationale:** [Why this entity was created]

### Updated Entities

#### Entity: [Name]
```javascript
mcp__memory__add_observations({
  observations: [{
    entityName: "[Entity Name]",
    contents: [
      "[New observation 1]",
      "[New observation 2]"
    ]
  }]
})
```
**Changes:** [What was added/modified]  
**Rationale:** [Why these updates were needed]

### Deleted Entities (if any)

#### Entity: [Name]
```javascript
mcp__memory__delete_entities({
  entityNames: ["[Entity Name]"]
})
```
**Reason for Deletion:** [Why removed]  
**Migration:** [Where knowledge was moved to]

---

## 🔗 Relation Updates

### Created Relations

#### Relation: [From] → [To]
```javascript
mcp__memory__create_relations({
  relations: [{
    from: "[Source Entity]",
    to: "[Target Entity]",
    relationType: "[uses/implements/depends_on/contains/extends]"
  }]
})
```
**Relationship Type:** [Explain the relationship]  
**Importance:** [Why this relation matters]

### Deleted Relations (if any)

#### Relation: [From] ❌ [To]
```javascript
mcp__memory__delete_relations({
  relations: [{
    from: "[Source Entity]",
    to: "[Target Entity]",
    relationType: "[Previous relation type]"
  }]
})
```
**Reason:** [Why this relation no longer exists]

---

## 📝 Observations Added

### Component/Module Observations

**Entity:** [Name]  
**New Observations:**
- [Technical detail 1]
- [Behavior observation]
- [Performance characteristic]
- [Integration point]

**Context:** [Why these observations are important]

---

## 🔍 Graph Query Results

### Pre-Update Query
```javascript
// Query to check existing state
mcp__memory__search_nodes({ query: "[search term]" })
```
**Results Found:** [What was already in graph]

### Post-Update Verification
```javascript
// Query to verify updates
mcp__memory__open_nodes({ names: ["[Entity1]", "[Entity2]"] })
```
**Verification Status:** [✅ Confirmed / ⚠️ Issues found]

---

## 🌳 Graph Structure Impact

### Before Update
```
ComponentA
├── uses → ServiceB
└── contains → ModuleC
```

### After Update
```
ComponentA
├── uses → ServiceB
├── contains → ModuleC
└── implements → InterfaceD (NEW)
```

---

## 🎯 Knowledge Categories

### Technical Knowledge
- [ ] Architecture decisions
- [ ] Implementation patterns
- [ ] Performance optimizations
- [ ] Security considerations

### Business Knowledge
- [ ] Feature requirements
- [ ] User workflows
- [ ] Business rules
- [ ] Domain concepts

### Operational Knowledge
- [ ] Deployment procedures
- [ ] Configuration details
- [ ] Monitoring setup
- [ ] Troubleshooting guides

---

## 📊 Impact Assessment

### Affected Components
- [Component 1]: [How it's affected]
- [Component 2]: [How it's affected]

### Dependent Systems
- [System 1]: [Impact description]
- [System 2]: [Impact description]

### Documentation Updates Needed
- [ ] Architecture diagrams
- [ ] API documentation
- [ ] User guides
- [ ] Developer documentation

---

## ✅ Validation Checklist

### Pre-Update Validation
- [ ] Searched for existing entities
- [ ] Verified no duplicates created
- [ ] Checked relation accuracy
- [ ] Confirmed observation relevance

### Post-Update Validation
- [ ] Entities created successfully
- [ ] Relations established correctly
- [ ] Observations attached properly
- [ ] Graph queries return expected results

### Quality Checks
- [ ] Naming conventions followed
- [ ] Entity types appropriate
- [ ] Relations semantically correct
- [ ] Observations provide value

---

## 🔄 Sync Status

**Sync Command Used:**
```bash
/sync-memory [path/to/files]
```

**Files Synced:**
- [file1.ts]: [Entities extracted]
- [file2.py]: [Entities extracted]

**Sync Results:**
- Entities Created: [Count]
- Relations Created: [Count]
- Errors: [Any errors encountered]

---

## 📋 Follow-Up Actions

### Immediate
- [ ] Verify graph integrity
- [ ] Update dependent documentation
- [ ] Notify affected teams/agents

### Future
- [ ] Review entity granularity
- [ ] Optimize relation structure
- [ ] Add missing observations

---

## 🔗 References

**Related Updates:**
- [Previous KG update IDs]
- [Related ticket numbers]

**Documentation:**
- Knowledge Graph Guide: `/docs/guides/knowledge_graph_guide.md`
- Entity Standards: [Link]
- Relation Types: [Link]

---

## 📝 Notes

**Special Considerations:**
[Any important notes about this update]

**Lessons Learned:**
[What was learned during this update]

**Recommendations:**
[Suggestions for future graph improvements]

---

*This knowledge graph update is complete and verified*