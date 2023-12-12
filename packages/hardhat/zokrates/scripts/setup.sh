#!/bin/sh

set -e

zokrates compile -i guessinhashes.zok

zokrates setup

zokrates export-verifier
