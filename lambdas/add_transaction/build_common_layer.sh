mkdir -p _tmp/python
cp ${1} _tmp/python
cd _tmp
zip -r common.zip python
mv common.zip ..
cd ..
rm -rf _tmp
