# Copy Content from the main place they live 
# in this repository to approapriate locations 
# in the docs directory which is the source that 
# github pages uses to publish from.    Note I
# did it this way to facilitate the more sophisticated
# demonstration using a custom server while also supporting
# a basic Demo using the static htmlo pages from the same
# code artifacts.
mkdir data
cp -r http-docs/js docs/js
cp -r http-docs/cs docs/cs
mkdir docs/data
mkdir docs/data/forms
cp -r data/forms/cs docs/data/forms
