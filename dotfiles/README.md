# Dotfiles

The repository also includes editor and terminal configuration snapshots under `dotfiles/`:

- `dotfiles/.config/nvim/`
- `dotfiles/.tmux/`
- `dotfiles/.tmux.conf`

These are stored as portable references or backup material for the environment used with this methodology. They are snapshots of the working environment and may include plugin source copies for portability. This folder is not part of the published npm package.

## Restore Neovim

```bash
mkdir -p ~/.config
cp -R dotfiles/.config/nvim ~/.config/
```

## Restore tmux

```bash
cp dotfiles/.tmux.conf ~/.tmux.conf
cp -R dotfiles/.tmux ~/.tmux
```

If you prefer a lighter restore, keep `~/.tmux.conf` and reinstall plugins separately instead of copying the full plugin snapshot.
