# Project instructions

## Background
This project aims to develop a generic Ocean Accounts dashboard framework, which will display some environmental accounting and environmental-economic accounting information, as well as some spatial visualization components. For now the spatial visualisation will be basic rendering of the accounting areas in the main dashboard, and another page where for now we'll imbed a google earth engine app (but in the future there'll be more native and comprehensive spatial rendering). The main functionality of the framework, is that the functionality is all generic, but is then able to read data from a specific country or jurisdiction and then build the corresponding dashboard, and then deploy it into a web app. The country choice is made by the developer, before the app is built/deployed, probably living on a separate branch on a repo for example. This way the generic framework can be worked on, and then at any point a branch for a specific country can be made and deployed.

## Key context
In the /instructions directory, there are comprehensive build specifications and plan for the app:
1. build_specifications.md - captures the comprehensive product and design requirements for the project, including any pre-analysis capability as well as the front end dashboard design and implementation.
2. project_plan.md - lays out the priority‑ordered roadmap for the detailing architecture choices, implementation idea, plans and intended outputs.
3. data_descriptors.md - this file contains a comprehensive description of the dashboard ready data and spatial data sources ot be used in the project. This may be empty, and also may evolve over time and this will also interact with the build spec and project plan

## Familiarization
Before beginning to solve problems or implement solutions, read and understand the three key context files. And then familiarize with the repo to ensure it aligns with your understanding of the context.

## Build checks
Because builds and Amplify deploys are involved, scan recent changes for type or lint failures and confirm whether the issues should be fixed before proceeding. If not, ask whether the Amplify build was successful and if it failed, ask for the Amplify build log.

## How to wrap up a session or new feature
When prompted to "wrap up" the session or chat - update the key context files with any relevant new information, features or changes we've made - this doesn't have to be minor function or aesthetic changes, only important features or differences in approaches that will affect understanding in subsequent sessions.