#!/bin/bash
set -e

installed() {
    hash "$1" 2>/dev/null
}

banner() {
    printf "\n\r\n\r====================================\n\r"
    printf "${1}"
    printf "\n\r====================================\n\r\n\r"
}

install_gems() {
    if installed bundle; then
        banner "Running bundle install for jekyll"
        bundle
    else
        EXTRA_STEPS+=("You need to install ruby to continue: https://www.ruby-lang.org/")
        EXTRA_STEPS+=("Once you have ruby you will need to install Bundler with: gem install bundler")
    fi
}

install_npm() {
    if installed node || installed npm; then
        banner "Running npm install"
        npm install
    else
        EXTRA_STEPS+=("You need to install node to continue https://nodejs.org/")
    fi
}

install_dependencies() {
    install_gems
    install_npm
}

compile_assets() {
    banner "Compiling assets"
    gulp build:simple
}

report() {
    if [[ ${#EXTRA_STEPS[@]} -gt 0 ]]; then
        echo -e
        echo "Remaining tasks: "
        for i in "${!EXTRA_STEPS[@]}"; do
            echo "  $((i+1)). ${EXTRA_STEPS[$i]}"
        done
    fi
}

main() {
    install_dependencies
    compile_assets
    report
}

main
