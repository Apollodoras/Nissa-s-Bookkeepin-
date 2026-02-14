# Nissa's Bookkeepin'

Professional bookkeeping for Sole Proprietors & Service Businesses (Exclusively designed for Massage Therapists & Estheticians).

## How to Install (Windows)

1. **Download**: Download the latest verified installer from the [Official Releases Page](https://github.com/Apollodoras/Nissa-s-Bookkeepin-/releases/latest).
   - Look for the `.exe` file under **Assets** and click it to download.
2. **Run**: Double-click the `.exe` file. 
3. **Smart Setup**: The app will automatically install and create a desktop shortcut.
4. **Data Privacy**: Your database is created locally on your machine. No data ever leaves your computer.

## Troubleshooting (Windows)

### Fix "Installer integrity check has failed"
If you see this error, it means the download was interrupted or a previous installation is blocking the update.
1. **Manual Cleanup**:
   - Press `Win + R`, type `%localappdata%\Programs`, and hit Enter.
   - Delete the `nissa-bookkeeping` folder.
   - Delete the shortcut on your Desktop.
2. **Redownload**: Download the installer again using the link above.

### Fix "A JavaScript error occurred in the main process"
This usually happens if you're running an older version (v1.0.0 or v1.1.0). Please follow the **Manual Cleanup** steps above and install **v1.1.1**.

## Features
- **Smart Categorization**: Tailored categories for Massage/Esthetician niche.
- **Business vs Personal**: Separate your finances with a single click.
- **Tax Ready**: Automatically tracks deductible expenses.

## Development
```bash
npm install
npm run dev
```
