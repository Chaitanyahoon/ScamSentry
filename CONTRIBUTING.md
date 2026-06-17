# Contributing to ScamSentry

First off, thank you for taking the time to contribute! Contributions of all forms—bug fixes, features, documentation, and extension updates—make this project better for everyone.

Please review the guidelines below to ensure a smooth contribution process.

---

## 🚀 Getting Started

1. **Fork the Repository**: Create a fork of this repository under your own GitHub account.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ScamSentry.git
   cd ScamSentry
   ```
3. **Set Up the Next.js Frontend**:
   * Refer to the Next.js setup instructions in the [README.md](README.md).
   * Run `npm install` and run `npm run dev` to start the web app.
4. **Set Up the FastAPI Backend**:
   * Refer to the backend setup instructions in the [README.md](README.md).
   * Create a python virtual environment, install `requirements.txt`, and start uvicorn.
5. **Set Up the Chrome Extension**:
   * Load the unpacked `extension/` folder in Google Chrome under developer mode.

---

## 🛡️ Coding Standards

* **TypeScript/JavaScript (Frontend & Extension)**:
  * Ensure all variables are typed correctly. Do not use `any` unless absolutely necessary.
  * Use standard camelCase for variables/functions and PascalCase for components.
  * Run linting before submitting code: `npm run lint`
* **Python (Backend)**:
  * We use **Ruff** for formatting and linting.
  * Ensure there are no duplicate imports or unused variables.
  * Run ruff check: `ruff check app/`

---

## 🧪 Testing Requirements

We require that all code modifications pass automated testing before merging.

### Frontend (Jest)
Run the automated Jest suite from the repository root:
```bash
npm run test
```

### Backend (Pytest)
Activate your Python virtual environment and run Pytest from the `backend/` folder:
```bash
pytest tests/ --ignore=tests/manual -v --asyncio-mode=auto
```

---

## 📬 Pull Request (PR) Guidelines

When submitting a Pull Request, please ensure:

1. **Create a Feature Branch**: Keep your branch descriptive (e.g. `feature/jwt-auth` or `bugfix/dmarc-dns`).
2. **Keep PRs Single-focused**: Avoid combining unrelated changes.
3. **Reference Issues**: Use tags like `Closes #12` or `Fixes #34` in your description.
4. **Pass CI/CD Checks**: Ensure both backend and frontend GitHub Action checks pass without error.
5. **Describe Your Work**: Fill out the Pull Request Template completely with details of what was changed and how to verify.
