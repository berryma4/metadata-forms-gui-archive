# Copy essential files to a named directory
# that will allow a basic demonstration form
# to be rendered.   Needed this because 
# the extent of demonstrations in this repo
# can make the system seem larger than needed
# I also wanted the ability to safely update a 
# repo with only the mforms contents without chaning
# user local forms.

# WIP UNDER CONSTRUCTION

mkdir -p %1
mkdir %1/data
mkdir %1/docs
mkdir -p %1/docs/forms
mkdir -p %1/data/forms/examples
cp -R docs/js %1/docs/js
cp -R docs/css %1/docs/css
cp -R http-server %1/http-server
cp -R data/forms/examples/simple-form.txt %1/data/forms/examples/simple-form.txt
