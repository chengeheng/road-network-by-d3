rm -rf ./lib/*
npx babel src/map --out-dir lib/map
mkdir ./lib/images
cp ./src/images/* ./lib/images
# npm publish
