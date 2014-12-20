#!/bin/bash -e

#####################################################
# Install NPM modules
#####################################################

printf "\n\r\n\r====================================\n\r\n\r"
printf "Installing NPM modules"
printf "\n\r\n\r====================================\n\r\n\r"

npm install

#####################################################
# Install Bower JS components
#####################################################

printf "\n\r\n\r====================================\n\r\n\r"
printf "Installing bower JS components"
printf "\n\r\n\r====================================\n\r\n\r"

pushd assets/javascripts
rm -rf components
bower install

popd

#####################################################
# Install Bower CSS components
#####################################################

printf "\n\n"
printf "Installing bower css components"
printf "\n\n"

pushd assets/stylesheets
rm -rf components
bower install

popd

#####################################################
# Compile clientside assets
#####################################################

printf "\n\r\n\r====================================\n\r\n\r"
printf "Compiling assets"
printf "\n\r\n\r====================================\n\r\n\r"

gulp build:simple

#####################################################
# Done
#####################################################

printf "\n\r\n\r====================================\n\r\n\r"
printf "Good to go."
printf "\n\r\n\r====================================\n\r\n\r"
