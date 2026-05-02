# Memory

_Curated long-term knowledge. Last updated: 2026-05-02 09:41:21_

## Catalog Distillate

- **[SB] Setup Builder Module** (`bmad-bmb-setup`): Install or update BMad Builder module config and help entries. | Phase: anytime
- **[BA] Build an Agent** (`bmad-agent-builder`): Create, edit, or rebuild an agent skill through conversational discovery. | Phase: anytime
- **[AA] Analyze an Agent** (`bmad-agent-builder`): Run quality analysis on an existing agent — structure, cohesion, prompt craft, and enhancement opportunities. | Phase: anytime | After: bmad-agent-builder:build-process
- **[BW] Build a Workflow** (`bmad-workflow-builder`): Create, edit, or rebuild a workflow or utility skill. | Phase: anytime
- **[AW] Analyze a Workflow** (`bmad-workflow-builder`): Run quality analysis on an existing workflow/skill — structure, efficiency, and enhancement opportunities. | Phase: anytime | After: bmad-workflow-builder:build-process
- **[CW] Convert a Skill** (`bmad-workflow-builder`): Convert any skill to BMad-compliant, outcome-driven equivalent with before/after HTML comparison report. | Phase: anytime
- **[IM] Ideate Module** (`bmad-module-builder`): Brainstorm and plan a BMad module — explore ideas, decide architecture, and produce a build plan. | Phase: anytime
- **[CM] Create Module** (`bmad-module-builder`): Scaffold module infrastructure into built skills, making them an installable BMad module. | Phase: anytime | After: bmad-module-builder:ideate-module
- **[VM] Validate Module** (`bmad-module-builder`): Check that a module's structure is complete, accurate, and all capabilities are properly registered. | Phase: anytime | After: bmad-module-builder:create-module
- **[BP] Brainstorm Project** (`bmad-brainstorming`): Expert guided facilitation through a single or multiple techniques. | Phase: 1-analysis
- **[MR] Market Research** (`bmad-market-research`): Market analysis competitive landscape customer needs and trends. | Phase: 1-analysis
- **[DR] Domain Research** (`bmad-domain-research`): Industry domain deep dive subject matter expertise and terminology. | Phase: 1-analysis
- **[TR] Technical Research** (`bmad-technical-research`): Technical feasibility architecture options and implementation approaches. | Phase: 1-analysis
- **[CB] Create Brief** (`bmad-product-brief`): An expert guided experience to nail down your product idea in a brief. a gentler approach than PRFAQ when you are already sure of your concept and nothing will sway you. | Phase: 1-analysis
- **[WB] PRFAQ Challenge** (`bmad-prfaq`): Working Backwards guided experience to forge and stress-test your product concept to ensure you have a great product that users will love and need through the PRFAQ gauntlet to determine feasibility and alignment with user needs. alternative to product brief. | Phase: 1-analysis
- **[CP] Create PRD** (`bmad-create-prd`): Expert led facilitation to produce your Product Requirements Document. | Phase: 2-planning | **REQUIRED**
- **[VP] Validate PRD** (`bmad-validate-prd`):  | Phase: 2-planning | After: bmad-create-prd
- **[EP] Edit PRD** (`bmad-edit-prd`):  | Phase: 2-planning | After: bmad-validate-prd
- **[CU] Create UX** (`bmad-create-ux-design`): Guidance through realizing the plan for your UX, strongly recommended if a UI is a primary piece of the proposed project. | Phase: 2-planning | After: bmad-create-prd
- **[CA] Create Architecture** (`bmad-create-architecture`): Guided workflow to document technical decisions. | Phase: 3-solutioning | **REQUIRED**
- **[CE] Create Epics and Stories** (`bmad-create-epics-and-stories`):  | Phase: 3-solutioning | After: bmad-create-architecture | **REQUIRED**
- **[IR] Check Implementation Readiness** (`bmad-check-implementation-readiness`): Ensure PRD UX Architecture and Epics Stories are aligned. | Phase: 3-solutioning | After: bmad-create-epics-and-stories | **REQUIRED**
- **[SP] Sprint Planning** (`bmad-sprint-planning`): Kicks off implementation by producing a plan the implementation agents will follow in sequence for every story. | Phase: 4-implementation | **REQUIRED**
- **[SS] Sprint Status** (`bmad-sprint-status`): Anytime: Summarize sprint status and route to next workflow. | Phase: 4-implementation | After: bmad-sprint-planning
- **[CS] Create Story** (`bmad-create-story`): Story cycle start: Prepare first found story in the sprint plan that is next or a specific epic/story designation. | Phase: 4-implementation | After: bmad-sprint-planning | **REQUIRED**
- **[VS] Validate Story** (`bmad-create-story`): Validates story readiness and completeness before development work begins. | Phase: 4-implementation | After: bmad-create-story:create
- **[DS] Dev Story** (`bmad-dev-story`): Story cycle: Execute story implementation tasks and tests then CR then back to DS if fixes needed. | Phase: 4-implementation | After: bmad-create-story:validate | **REQUIRED**
- **[CR] Code Review** (`bmad-code-review`): Story cycle: If issues back to DS if approved then next CS or ER if epic complete. | Phase: 4-implementation | After: bmad-dev-story
- **[CK] Checkpoint** (`bmad-checkpoint-preview`): Guided walkthrough of a change from purpose and context into details. Use for human review of commits branches or PRs. | Phase: 4-implementation
- **[QA] QA Automation Test** (`bmad-qa-generate-e2e-tests`): Generate automated API and E2E tests for implemented code. NOT for code review or story validation — use CR for that. | Phase: 4-implementation | After: bmad-dev-story
- **[ER] Retrospective** (`bmad-retrospective`): Optional at epic end: Review completed work lessons learned and next epic or if major issues consider CC. | Phase: 4-implementation | After: bmad-code-review
- **[DP] Document Project** (`bmad-document-project`): Analyze an existing project to produce useful documentation. | Phase: anytime
- **[GPC] Generate Project Context** (`bmad-generate-project-context`): Scan existing codebase to generate a lean LLM-optimized project-context.md. Essential for brownfield projects. | Phase: anytime
- **[QQ] Quick Dev** (`bmad-quick-dev`): Unified intent-in code-out workflow: clarify plan implement review and present. | Phase: anytime
- **[CC] Correct Course** (`bmad-correct-course`): Navigate significant changes. May recommend start over update PRD redo architecture sprint planning or correct epics and stories. | Phase: anytime
- **[WD] Write Document** (`bmad-agent-tech-writer`): Describe in detail what you want, and the agent will follow documentation best practices. Multi-turn conversation with subprocess for research/review. | Phase: anytime
- **[US] Update Standards** (`bmad-agent-tech-writer`): Update agent memory documentation-standards.md with your specific preferences if you discover missing document conventions. | Phase: anytime
- **[MG] Mermaid Generate** (`bmad-agent-tech-writer`): Create a Mermaid diagram based on user description. Will suggest diagram types if not specified. | Phase: anytime
- **[VD] Validate Document** (`bmad-agent-tech-writer`): Review the specified document against documentation standards and best practices. Returns specific actionable improvement suggestions organized by priority. | Phase: anytime
- **[EC] Explain Concept** (`bmad-agent-tech-writer`): Create clear technical explanations with examples and diagrams for complex concepts. | Phase: anytime
- **[BSP] Brainstorming** (`bmad-brainstorming`): Use early in ideation or when stuck generating ideas. | Phase: anytime
- **[PM] Party Mode** (`bmad-party-mode`): Orchestrate multi-agent discussions when you need multiple perspectives or want agents to collaborate. | Phase: anytime
- **[BH] BMad Help** (`bmad-help`):  | Phase: anytime
- **[ID] Index Docs** (`bmad-index-docs`): Use when LLM needs to understand available docs without loading everything. | Phase: anytime
- **[SD] Shard Document** (`bmad-shard-doc`): Use when doc becomes too large (>500 lines) to manage effectively. | Phase: anytime
- **[EP] Editorial Review - Prose** (`bmad-editorial-review-prose`): Use after drafting to polish written content. | Phase: anytime
- **[ES] Editorial Review - Structure** (`bmad-editorial-review-structure`): Use when doc produced from multiple subprocesses or needs structural improvement. | Phase: anytime
- **[AR] Adversarial Review** (`bmad-review-adversarial-general`): Use for quality assurance or before finalizing deliverables. Code Review in other modules runs this automatically, but also useful for document reviews. | Phase: anytime
- **[ECH] Edge Case Hunter Review** (`bmad-review-edge-case-hunter`): Use alongside adversarial review for orthogonal coverage — method-driven not attitude-driven. | Phase: anytime
- **[DG] Distillator** (`bmad-distillator`): Use when you need token-efficient distillates that preserve all information for downstream LLM consumption. | Phase: anytime
- **[BC] BMad Customize** (`bmad-customize`): Use when you want to change how an agent or workflow behaves — add persistent facts, swap templates, insert activation hooks, or customize menus. Scans what's customizable, picks the right scope (agent vs workflow), writes the override to _bmad/custom/, and verifies the merge. No TOML hand-authoring required. | Phase: anytime
- **[IS] Innovation Strategy** (`bmad-cis-innovation-strategy`): Identify disruption opportunities and architect business model innovation.
- **[PS] Problem Solving** (`bmad-cis-problem-solving`): Apply systematic problem-solving methodologies to crack complex challenges.
- **[DT] Design Thinking** (`bmad-cis-design-thinking`): Guide human-centered design processes using empathy-driven methodologies.
- **[BS] Brainstorming** (`bmad-brainstorming`): Facilitate brainstorming sessions using one or more techniques.
- **[ST] Storytelling** (`bmad-cis-storytelling`): Craft compelling narratives using proven story frameworks and techniques.
- **[DP] Document Project** (`gds-document-project`): Analyze an existing game project to produce useful documentation.
- **[QP] Quick Prototype** (`gds-quick-prototype`): Rapid game prototyping to test mechanics and ideas quickly.
- **[QD] Quick Dev** (`gds-quick-dev`): Clarify plan implement review and present any user intent or change request in a single workflow.
- **[CC] Correct Course** (`gds-correct-course`): Navigate significant changes during game dev sprint when implementation is off-track.
- **[BG] Brainstorm Game** (`gds-brainstorm-game`): Facilitate game brainstorming sessions with game-specific context and techniques.
- **[MR] Market Research** (`gds-market-research`): Game market analysis competitive landscape player needs and trends.
- **[DR] Domain Research** (`gds-domain-research`): Game industry domain deep dive subject matter expertise and terminology.
- **[TR] Technical Research** (`gds-technical-research`): Technical feasibility game engine options and implementation approaches.
- **[GB] Game Brief** (`gds-create-game-brief`): Interactive game brief creation that guides users through defining their game vision.
- **[GDD] Game Design Document** (`gds-create-gdd`): Create a GDD with mechanics systems progression and implementation guidance.
- **[PC] Project Context** (`gds-generate-project-context`): Create optimized project-context.md for chosen agentic tool consistency.
- **[GA] Game Architecture** (`gds-game-architecture`): Produce a scale-adaptive game architecture with engine systems networking and technical design.
- **[TF] Test Framework** (`gds-test-framework`): Initialize game test framework architecture for Unity Unreal Engine or Godot projects.
- **[SP] Sprint Planning** (`gds-sprint-planning`): Generate or update sprint-status.yaml from epic files.
- **[TA] Test Automate** (`gds-test-automate`): Generate automated game tests.
- **[ER] Retrospective** (`gds-retrospective`): Facilitate team retrospective after a game development epic is completed. | Phase: gds-code-review
- **[IR] Check Implementation Readiness** (`gds-check-implementation-readiness`): Ensure GDD UX Architecture and Epics Stories are aligned before production begins. | Phase: gds-create-epics-and-stories
- **[VG] Validate GDD** (`gds-validate-gdd`): Validate an existing GDD against standards. Delegates to gds-validate-prd until GDD-specific checks are authored. | Phase: gds-create-gdd
- **[ND] Narrative Design** (`gds-create-narrative`): Create comprehensive narrative documentation including story structure character arcs and world-building. Use for story-driven games. | Phase: gds-create-gdd
- **[CU] Create UX Design** (`gds-create-ux-design`): Guidance through realizing the plan for your game UX/UI, strongly recommended if UI is a primary piece of the proposed game. | Phase: gds-create-gdd
- **[CP] Create PRD** (`gds-create-prd`): Create a PRD from GDD or from scratch for use with external tools like bmad-assist. | Phase: gds-create-gdd
- **[VP] Validate PRD** (`gds-validate-prd`): Validate PRD against standards for external tool compatibility. | Phase: gds-create-prd
- **[DS] Dev Story** (`gds-dev-story`): Execute Dev Story workflow implementing tasks and tests. | Phase: gds-create-story
- **[CR] Code Review** (`gds-code-review`): Perform thorough clean context QA code review on stories flagged Ready for Review. | Phase: gds-dev-story
- **[PP] Playtest Plan** (`gds-playtest-plan`): Create structured playtesting plan. | Phase: gds-e2e-scaffold
- **[CE] Create Epics and Stories** (`gds-create-epics-and-stories`): Create the Epics and Stories listing from GDD requirements. These are the specs that drive development. | Phase: gds-game-architecture
- **[TR] Test Review** (`gds-test-review`): Review test quality and coverage. | Phase: gds-performance-test
- **[PT] Performance Test** (`gds-performance-test`): Design performance testing strategy. | Phase: gds-playtest-plan
- **[SS] Sprint Status** (`gds-sprint-status`): View sprint progress surface risks and get next action recommendation. | Phase: gds-sprint-planning
- **[CS] Create Story** (`gds-create-story`): Create Story with comprehensive context for developer agent implementation. | Phase: gds-sprint-planning
- **[ES] E2E Scaffold** (`gds-e2e-scaffold`): Scaffold E2E testing infrastructure. | Phase: gds-test-automate
- **[TD] Test Design** (`gds-test-design`): Create comprehensive game test scenarios covering gameplay progression and quality requirements. | Phase: gds-test-framework
- **[EG] Edit GDD** (`gds-edit-gdd`): Improve and enhance an existing GDD. Delegates to gds-edit-prd until GDD-specific edit flow is authored. | Phase: gds-validate-gdd
- **[EP] Edit PRD** (`gds-edit-prd`): Improve and enhance an existing PRD. | Phase: gds-validate-prd
- **[TMT] Teach Me Testing** (`bmad-teach-me-testing`): Teach testing fundamentals through 7 sessions (TEA Academy).
- **[TD] Test Design** (`bmad-testarch-test-design`): Risk-based test planning. | After: bmad-testarch-framework
- **[AT] ATDD** (`bmad-testarch-atdd`): Generate red-phase acceptance test scaffolds before implementation. | Phase: bmad-create-story:create | After: bmad-dev-story
- **[TA] Test Automation** (`bmad-testarch-automate`): Expand test coverage. | Phase: bmad-testarch-atdd

## Second Brain (Knowledge Graph)

The **Second Brain** plugin (`paperclip.second-brain`) provides a long-term memory layer for the company. It automatically indexes:
- **Issues**: Created and updated events.
- **Goals**: Created and updated events.
- **Documents**: Created and updated events.

### Available Knowledge Tools:
- `query_knowledge(query, limit?)`: Search the knowledge graph for context. Use this when you need background on a project, goal, or issue that isn't in your immediate context.
- `get_entity_relationships(entityType, entityId)`: Discover links between entities (e.g., what goals this issue supports, what documents are related).
- `suggest_related_context(content, limit?)`: Find related entities based on a block of text.

Agents should use these tools to ensure alignment with company-wide goals and to avoid duplicating research or work documented in other issues/documents.
- **[RV] Test Review** (`bmad-testarch-test-review`): Quality audit (0-100 scoring). | Phase: bmad-testarch-automate
- **[NR] NFR Assessment** (`bmad-testarch-nfr`): Non-functional requirements assessment. | Phase: bmad-testarch-automate
- **[CI] CI Setup** (`bmad-testarch-ci`): Configure CI/CD quality pipeline. | Phase: bmad-testarch-framework
- **[TF] Test Framework** (`bmad-testarch-framework`): Initialize production-ready test framework. | Phase: bmad-testarch-test-design | After: bmad-testarch-ci
- **[TR] Traceability** (`bmad-testarch-trace`): Coverage traceability and gate. | Phase: bmad-testarch-test-review


## Module Documentation Distillate

### BMad Builder Documentation
Source: https://bmad-builder-docs.bmad-method.org/llms.txt
# BMad Builder Documentation
## Quick Start
- **[Quick Start](https://bmad-builder-docs.bmad-method.org/tutorials/quick-start)** - Get started with BMad Builder
- **[Installation](https://bmad-builder-docs.bmad-method.org/reference/installation)** - Installation guide
## Core Concepts
- **[What is BMad Builder?](https://bmad-builder-docs.bmad-method.org/explanation/what-is-builder)** - Understanding the tool
- **[Creating Agents](https://bmad-builder-docs.bmad-method.org/how-to/create-agent)** - Create custom agents
- **[Creating Workflows](https://bmad-builder-docs.bmad-method.org/how-to/create-workflow)** - Create custom workflows
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://bmad-builder-docs.bmad-method.org/llms-full.txt) - Complete docs for AI context

### BMad Method Documentation
Source: https://docs.bmad-method.org/llms.txt
# BMAD Method Documentation
## Quick Start
- **[Getting Started](https://docs.bmad-method.org//tutorials/getting-started/)** - Tutorial: install and learn how BMad works
- **[Installation](https://docs.bmad-method.org//how-to/install-bmad/)** - How to install BMad Method
## Core Concepts
- **[Quick Flow](https://docs.bmad-method.org//explanation/quick-flow/)** - Unified quick workflow — clarify intent, plan, implement, review, present
- **[Party Mode](https://docs.bmad-method.org//explanation/party-mode/)** - Multi-agent collaboration
- **[Workflow Map](https://docs.bmad-method.org//reference/workflow-map/)** - Visual overview of phases and workflows
## Modules
- **[Official Modules](https://docs.bmad-method.org//reference/modules/)** - BMM, BMB, BMGD, and more
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://docs.bmad-method.org//llms-full.txt) - Complete docs for AI context

### Core Documentation
Source: https://docs.bmad-method.org/llms.txt
# BMAD Method Documentation
## Quick Start
- **[Getting Started](https://docs.bmad-method.org//tutorials/getting-started/)** - Tutorial: install and learn how BMad works
- **[Installation](https://docs.bmad-method.org//how-to/install-bmad/)** - How to install BMad Method
## Core Concepts
- **[Quick Flow](https://docs.bmad-method.org//explanation/quick-flow/)** - Unified quick workflow — clarify intent, plan, implement, review, present
- **[Party Mode](https://docs.bmad-method.org//explanation/party-mode/)** - Multi-agent collaboration
- **[Workflow Map](https://docs.bmad-method.org//reference/workflow-map/)** - Visual overview of phases and workflows
## Modules
- **[Official Modules](https://docs.bmad-method.org//reference/modules/)** - BMM, BMB, BMGD, and more
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://docs.bmad-method.org//llms-full.txt) - Complete docs for AI context

### Creative Intelligence Suite Documentation
Source: https://cis-docs.bmad-method.org/llms.txt
# Creative Intelligence Suite Documentation
## Quick Start
- **[Quick Start](https://cis-docs.bmad-method.org/tutorials/quick-start)** - Get started with CIS
- **[Installation](https://cis-docs.bmad-method.org/reference/installation)** - Installation guide
## Core Concepts
- **[What is CIS?](https://cis-docs.bmad-method.org/explanation/what-is-cis)** - Understanding the suite
- **[Brainstorming](https://cis-docs.bmad-method.org/how-to/brainstorm)** - Brainstorming workflows
- **[Problem Solving](https://cis-docs.bmad-method.org/how-to/solve-problems)** - Problem-solving agents
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://cis-docs.bmad-method.org/llms-full.txt) - Complete docs for AI context

### Game Dev Studio Documentation
Source: https://game-dev-studio-docs.bmad-method.org/llms.txt
# BMad Game Dev Studio Documentation
## Quick Start
- **[Quick Start](https://game-dev-studio-docs.bmad-method.org/tutorials/quick-start)** - Get started with BMGD
- **[Installation](https://game-dev-studio-docs.bmad-method.org/reference/installation)** - Installation guide
## Core Concepts
- **[What is BMGD?](https://game-dev-studio-docs.bmad-method.org/explanation/what-is-bmgd)** - Understanding the module
- **[Unity Support](https://game-dev-studio-docs.bmad-method.org/how-to/unity)** - Unity game development
- **[Unreal Support](https://game-dev-studio-docs.bmad-method.org/how-to/unreal)** - Unreal game development
- **[Godot Support](https://game-dev-studio-docs.bmad-method.org/how-to/godot)** - Godot game development
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://game-dev-studio-docs.bmad-method.org/llms-full.txt) - Complete docs for AI context

### Test Architecture Enterprise Documentation
Source: https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/llms.txt
# Test Architect (TEA) Documentation
## Quick Start
- **[TEA Lite Quickstart](https://test-architect.bmad-method.org/docs/tutorials/tea-lite-quickstart)** - Get started in 30 minutes
- **[Installation](https://test-architect.bmad-method.org/)** - Installation guide
## Core Workflows
- **[Test Design (TD)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-test-design)** - Risk-based test planning
- **[ATDD (AT)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-atdd)** - Failing acceptance tests first
- **[Automate (TA)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-automate)** - Expand automation coverage
- **[Trace (TR)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-trace)** - Requirements traceability
## Additional Workflows
- **[Framework (TF)](https://test-architect.bmad-method.org/docs/how-to/workflows/setup-test-framework)** - Scaffold test framework
- **[CI (CI)](https://test-architect.bmad-method.org/docs/how-to/workflows/setup-ci)** - CI/CD quality pipeline
- **[Test Review (RV)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-test-review)** - Quality audit
- **[NFR Assess (NR)](https://test-architect.bmad-method.org/docs/how-to/workflows/run-nfr-assess)** - Non-functional requirements
---
## Quick Links
- [Full Documentation (llms-full.txt)](https://test-architect.bmad-method.org/llms-full.txt) - Complete docs for AI context
- [Source Bundle](https://test-architect.bmad-method.org/downloads/tea-sources.zip) - Complete source code
- [Prompts Bundle](https://test-architect.bmad-method.org/downloads/tea-prompts.zip) - Agent prompts and workflows


## Project State
_Scan artifact folders to determine completion._
