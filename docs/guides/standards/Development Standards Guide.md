---
title: Development Standards Guide
description: Non-negotiable standards for secure, stable, maintainable, and high-quality code
type: guide
category: standards
tags: [code-quality, security, testing, documentation]
created: 08-03-2025
updated: 08-03-2025
---

# **Development Standards Guide**

This document outlines the non-negotiable standards for all development work. These rules ensure our codebase is secure, stable, maintainable, and high-quality. Adherence to these standards is mandatory.

## Related Guides
- **Development Workflow**: See `Development Workflow Guide.md` for process and status transitions
- **Documentation**: See `Documentation Guide.md` for documentation requirements
- **Templates**: Available in `/home/hd/Desktop/LAB/Dev-Agency/docs/reference/templates/`

## **1\. Code Quality & Craftsmanship**

* **Production-Ready Code:** All code must be clean, well-commented, and include comprehensive error handling. Write code as if someone else will have to maintain it.  
* **Follow Conventions:** Adhere to the established patterns, style guides, and architectural conventions of the project. Before writing new code, understand the existing code.  
* **Avoid Duplication:** Actively refactor and reuse code where appropriate. Do not write duplicate code; create shared utilities or services instead.  
* **No Shortcuts:**  
  * **Fix the Root Cause:** Never implement temporary workarounds. Investigate and resolve the underlying issue.  
  * **No Mocking in Production:** Never fake functionality or mock responses in production code.  
  * **Handle All Errors:** Never ignore errors or suppress exceptions without proper handling and logging.  
* **Manage Technical Debt:** If a "quick fix" is required for an emergency, it **must** be accompanied by a new ticket to address the root cause. This ticket must be prioritized for the next sprint.

## **2\. Testing & Reliability**

* **Comprehensive Test Coverage:** New code must meet minimum test coverage requirements.  
  * **85%** for general functionality.  
  * **95%** for critical paths, including authentication, payments, core business logic, error handling, and data integrity operations.  
* **Structured Logging:** Implement structured logging (e.g., JSON) for all services to ensure visibility and traceability.  
  * **Use Appropriate Levels:** Use DEBUG, INFO, WARN, and ERROR correctly.  
  * **Log Meaningful Events:** Log key application events, error conditions with full stack traces, and summaries of external API calls.  
  * **Include Correlation IDs:** Ensure a correlation ID is present in logs to trace a single request across multiple services.

## **3\. Security & Data Integrity**

* **Protect Sensitive Data:** **NEVER** log, expose, or insecurely transmit Personally Identifiable Information (PII), passwords, API keys, or any other secrets.  
* **Secure Coding Practices:** Actively use secure coding principles, including input validation and output encoding, to prevent common vulnerabilities (e.g., XSS, SQL injection).  
* **Dependency Audits:** Regularly scan and update project dependencies to patch known security vulnerabilities.

## **4\. Documentation & File Hygiene**

* **README Diligence:** Every module folder must have a README.md file. Review it before making changes and update it afterward if your changes affect the module's API, configuration, or core behavior.  
* **File Creation Discipline:**  
  1. **Search First:** Before creating any new file, search for an existing one that serves the same purpose. Avoid duplication.  
  2. **Clear Purpose:** Each file must have one specific, well-defined purpose.  
  3. **Correct Location:** Ensure new files are created in the correct module and folder, following the established project structure.  
  4. **No Versioning in Names:** Never add suffixes like \-v2, \-old, \-temp, or \-new to filenames. Use Git for version control.  
* **Archive Protocol:** Do not create ad-hoc archive folders. To archive files:  
  1. Create a dated and descriptive folder inside your project's `/Archive/` directory (e.g., `/Archive/2025-08-03-Refactor-Auth-Service/`).  
  2. Add a brief `archive-reason.md` file explaining what was archived and why.  
  3. Move the old files into the new folder. **Never delete them.**
