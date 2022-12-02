rm -rf ./lib/images
tsc -p tsconfig.json --outDir lib/map 
mkdir ./lib/images
cp ./src/images/* ./lib/images