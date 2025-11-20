# SCOUT: Val Town Studio Codebase Overview

**Last Updated**: November 20, 2025, 3:30 PM EST  
**Migration Status**: Phase 8 - Manual Testing (97% Complete)

## 🎯 Project Summary

**Val Town Studio** is a modern, browser-based SQLite database GUI built exclusively for [Val Town](https://val.town). Originally a multi-database tool called "Outerbase Studio," it has been refactored to support **only Val Town SQLite** databases.

**Key Achievement**: The migration from multi-database to Val Town-only is **97% complete** with all automated tests passing (93/93 tests).

## 🏗️ Architecture Overview

### 1. **Studio-First Design Pattern**
- **No connection management pages** - app launches directly into database interface
- **Single authentication flow** via Val Town API token stored in localStorage
- **Simplified UX** - users see token input screen only on first visit or after disconnect

### 2. **Driver Architecture** (`src/drivers/`)
```
┌─ Base Driver Interface (base-driver.ts)
│   └─ Defines QueryableBaseDriver contract
└─ Val Town Driver (database/valtown.ts)
    └─ Only active implementation - HTTP API calls to Val Town
```

### 3. **Core Components** (`src/components/`)
- **`valtown-studio-wrapper.tsx`** - Main entry point, handles auth flow
- **`gui/studio.tsx`** - Primary Studio interface component  
- **`gui/`** - Contains all database GUI components (tables, query editor, schema browser)

### 4. **Authentication Flow**
1. User visits `/` → `ValtownStudioWrapper` checks localStorage for token
2. No token → Shows inline token configuration UI
3. Valid token → Creates `ValtownQueryable` driver → Renders Studio
4. Token stored in localStorage (`valtown_token`, `valtown_connection_name`)

## 🚀 Current Status: Ready for Manual Testing

### ✅ Completed (Automated)
- All 93 unit tests passing
- TypeScript compilation clean
- Production build successful (682kB First Load JS)
- Linting passes with Biome
- Studio-First UI implemented

### 📋 Next: Manual Testing Phase
**You are here**: Phase 8 - Manual Testing & Deployment

**Immediate tasks**:
1. **Manual test the user flows** using `MANUAL_TESTING_CHECKLIST.md`
2. **Verify token persistence** across browser sessions
3. **Test database operations** (queries, schema browsing, table creation)
4. **Validate disconnect/reconnect** functionality

## 🛠️ Key Files to Understand

### Authentication & Entry Points
- `src/app/page.tsx` - Root route, renders Studio wrapper
- `src/components/valtown-studio-wrapper.tsx` - Token UI + Studio orchestration
- `src/lib/valtown-token-storage.ts` - localStorage token management

### Database Layer  
- `src/drivers/base-driver.ts` - Driver interface definitions
- `src/drivers/database/valtown.ts` - Val Town API implementation
- `src/drivers/sqlite/` - SQLite parsing utilities (schema management)

### Core Studio
- `src/components/gui/studio.tsx` - Main Studio component
- `src/core/` - Extension system and query pipeline
- `src/outerbase-cloud/` - API client utilities (legacy naming)

## 🎯 Quick Start Commands

```bash
# Development
bun run dev          # Start dev server on port 3008

# Testing  
bun test            # Run all unit tests (93 tests)
bun run tsc         # Type checking
bun run lint        # Linting with Biome

# Build
bun run build       # Production build
```

## 💡 Tips for Resuming Development

1. **Start with manual testing** - Use the checklist to verify core flows work
2. **Check console errors** - Monitor browser console during testing
3. **Test token lifecycle** - Enter token → use Studio → disconnect → reconnect
4. **Verify database operations** - Run queries, create tables, browse schema
5. **Review error handling** - Test with invalid tokens, network issues

## 🔍 What to Look For

**Good signs**: Clean console, smooth token flow, working queries, proper disconnect  
**Red flags**: Console errors, token not persisting, query failures, UI freezing

## 📚 Reference Documents

- `MANUAL_TESTING_CHECKLIST.md` - Complete testing checklist  
- `VALTOWN_MIGRATION_PLAN.md` - Migration history and details
- `AGENTS.md` - Development commands and conventions
- `CLAUDE.md` - Comprehensive development guide

---

**Bottom line**: The codebase is stable, tested, and ready for final validation. Focus on manual testing the user experience - if the token flow works smoothly and database operations execute correctly, you're ready for deployment.