# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run start` - Start the Discord bot in production mode
- `npm run dev` - Start the bot with file watching for development
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Discord bot for student verification using web scraping. The application has two main components:

### Bot Component (`src/bot/`)
- **Entry Point**: `src/bot/index.js` - Sets up Discord client with required intents and collections
- **Command System**: Auto-loads commands from `commands/` directory and interactions from `interactions/` directory
- **Event System**: Modular event handlers loaded via `events/index.js`
- **Configuration**: Environment-based config in `config.js` requiring `DISCORD_TOKEN`, `GUILD_ID`, and `VERIFIED_ROLE_ID`

### Web Scraper Component (`src/crawler.js`)
- **EtLabScraper class**: Puppeteer-based scraper for `sctce.etlab.in` student portal
- **Profile Data Extraction**: Scrapes student information (admission number, name, email, batch, phone, image)
- **Status Codes**: Well-defined error handling with specific status codes for different failure scenarios
- **Browser Management**: Handles browser lifecycle with proper cleanup and error handling

### Data Layer
- **Database**: MongoDB via Mongoose for profile storage
- **Profile Schema**: Comprehensive student profile model with validation, XP/leveling system, and timestamps
- **Connection**: Auto-initializes database connection on startup

## Key Integration Points

The bot and scraper work together for student verification:
1. Students use Discord commands to initiate verification
2. Bot uses EtLabScraper to validate credentials against the college portal
3. Successful verification stores profile data and assigns Discord roles
4. Profile data supports gamification features (XP, levels, coins)

## Environment Variables Required

- `DISCORD_TOKEN` - Discord bot token
- `GUILD_ID` - Target Discord server ID  
- `VERIFIED_ROLE_ID` - Role assigned to verified students
- `MONGODB_URI` - MongoDB connection string (inferred from database usage)

## Development Notes

- Uses CommonJS module system throughout
- ESLint configured for Node.js environment with basic recommended rules
- Prettier configured with single quotes, trailing commas, and 120 character line width
- No test framework currently configured