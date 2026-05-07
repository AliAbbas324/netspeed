#!/bin/bash

# Exit on error
set -e

APP_NAME="netspeed"
VERSION="1.0.0"
ARCH="amd64"
DEB_DIR="${APP_NAME}_${VERSION}_${ARCH}"

echo "Starting build process for ${APP_NAME} v${VERSION}..."

# 1. Build the Wails app if the binary doesn't exist or if you want to always rebuild
echo "Building the Wails application..."
wails build -platform linux/amd64 -clean

# 2. Create the package directory structure
echo "Creating directory structure..."
mkdir -p "$DEB_DIR/DEBIAN"
mkdir -p "$DEB_DIR/usr/bin"
mkdir -p "$DEB_DIR/usr/share/applications"
mkdir -p "$DEB_DIR/usr/share/icons/hicolor/512x512/apps"

# 3. Create the control file
echo "Creating DEBIAN/control..."
cat <<EOF > "$DEB_DIR/DEBIAN/control"
Package: $APP_NAME
Version: $VERSION
Section: utils
Priority: optional
Architecture: $ARCH
Maintainer: Ali Malik <email@example.com>
Description: NetSpeed Meter
 A floating network speed meter for Linux built with Wails.
EOF

# 4. Create the desktop entry
echo "Creating desktop file..."
cat <<EOF > "$DEB_DIR/usr/share/applications/$APP_NAME.desktop"
[Desktop Entry]
Name=NetSpeed
Comment=Floating network speed meter
Exec=/usr/bin/$APP_NAME
Icon=$APP_NAME
Terminal=false
Type=Application
Categories=Utility;Network;
EOF

# 5. Copy the compiled binary
echo "Copying binary..."
cp "build/bin/$APP_NAME" "$DEB_DIR/usr/bin/"
chmod 755 "$DEB_DIR/usr/bin/$APP_NAME"

# 6. Copy the application icon
echo "Copying application icon..."
if [ -f "build/appicon.png" ]; then
    cp "build/appicon.png" "$DEB_DIR/usr/share/icons/hicolor/512x512/apps/$APP_NAME.png"
    chmod 644 "$DEB_DIR/usr/share/icons/hicolor/512x512/apps/$APP_NAME.png"
else
    echo "Warning: build/appicon.png not found. The app might not have an icon in the launcher."
fi

# 7. Build the .deb package
echo "Building the .deb package..."
dpkg-deb --build "$DEB_DIR"

# 8. Clean up the directory structure
echo "Cleaning up..."
rm -rf "$DEB_DIR"

echo "Done! The package ${DEB_DIR}.deb has been created."
