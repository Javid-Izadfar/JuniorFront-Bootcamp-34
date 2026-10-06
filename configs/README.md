# VS Code Setup for HTML and CSS

This is a small, beginner-friendly VS Code setup for our HTML and CSS work.

## 1. Install VS Code

Download Visual Studio Code from:

https://code.visualstudio.com/

## 2. Install the core extensions

Open the Extensions view with `Cmd+Shift+X` on macOS or `Ctrl+Shift+X` on Windows/Linux. Search for each extension ID and install it.

- `ritwickdey.LiveServer` - runs the website in a local browser and reloads it after changes
- `esbenp.prettier-vscode` - formats HTML and CSS consistently
- `ecmel.vscode-html-css` - completes CSS classes and IDs inside HTML
- `formulahendry.auto-rename-tag` - renames matching HTML tags together
- `christian-kohler.path-intellisense` - completes file and image paths
- `streetsidesoftware.code-spell-checker` - catches spelling mistakes
- `editorconfig.editorconfig` - keeps formatting consistent between computers

You can also install all core extensions from a terminal:

### macOS and Linux

```bash
code --install-extension ritwickdey.LiveServer
code --install-extension esbenp.prettier-vscode
code --install-extension ecmel.vscode-html-css
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension editorconfig.editorconfig
```

### Windows PowerShell

```powershell
code --install-extension ritwickdey.LiveServer
code --install-extension esbenp.prettier-vscode
code --install-extension ecmel.vscode-html-css
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension editorconfig.editorconfig
```

If `code` is not recognized, install extensions from VS Code's Extensions view instead.

## 3. Optional appearance extensions

These make VS Code look like my setup, but they are not required for class:

- `catppuccin.catppuccin-vsc` - Catppuccin color theme
- `emmanuelbeziat.vscode-great-icons` - file icons

## 4. Install fonts

We use two fonts in VS Code:

* **Nova Nerd Font** - our main coding font. It includes programming ligatures and Nerd Font symbols.
* **Vazir Code** - a monospaced Persian/Farsi font for writing and reading Persian code comments and text.

### Nova Nerd Font

Download the font from:

https://github.com/icarusgk/nova-font

Open the repository and download the font files from the **Releases** section or the font files provided by the project.

Install the font for your operating system:

**macOS**

1. Open the downloaded `.ttf` font file.
2. Click **Install Font**.
3. Repeat for the font variants you want to install.

**Windows**

1. Select the downloaded `.ttf` font file.
2. Right-click and choose **Install** or **Install for all users**.
3. Repeat for the font variants you want to install.

**Linux**

1. Copy the downloaded font files to `~/.local/share/fonts/`.
2. Open a terminal and run:

```bash
fc-cache -f -v
```

### Vazir Code

Download the font from:

https://github.com/rastikerdar/vazir-code-font

Install the `.ttf` font files using the same steps above for your operating system.

> **Note:** Vazir Code is an older/discontinued project, but we use it in this course because it provides good Persian/Farsi support for coding.

### Select the font in VS Code

After installing the fonts:

1. Open VS Code.
2. Open **Preferences: Open User Settings (JSON)** from the Command Palette.
3. Make sure the following setting exists:

```json
{
  "editor.fontFamily": "Nova Nerd Font, Vazir Code, monospace"
}
```

The order matters:

1. VS Code tries **Nova Nerd Font** first.
2. If a character isn't available, it can fall back to **Vazir Code**.
3. Finally, it falls back to the system's `monospace` font.


## 5. Add the settings

1. Open the Command Palette with `Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux.
2. Run **Preferences: Open User Settings (JSON)**.
3. Replace its contents with the contents of the included `settings.json` file.
4. Save and restart VS Code.

If you already have custom settings, copy the individual properties instead of replacing the whole file.

## 6. Open a website

1. In VS Code, select **File > Open Folder** and open your project folder.
2. Open `index.html`.
3. Click **Go Live** in the status bar, or right-click `index.html` and select **Open with Live Server**.
4. Edit the HTML or CSS and save. The browser should reload automatically.

## Formatting

Files format automatically when saved. You can also run **Format Document**:

- macOS: `Shift+Option+F`
- Windows/Linux: `Shift+Alt+F`

## Optional tools for later lessons

Install these only when the course uses the related technology:

- `stylelint.vscode-stylelint` - advanced CSS linting; requires project configuration
- `bradlc.vscode-tailwindcss` - Tailwind CSS support
- `csstools.postcss` - PostCSS support

## Notes

- VS Code already includes HTML, CSS, Emmet, and browser debugging support.
- This setup excludes JavaScript frameworks, AI assistants, Python, Docker, databases, SSH, and machine-specific settings.
- No special font is required. VS Code uses the computer's normal monospace font.
