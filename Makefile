.PHONY: test htmltest jstest doctest

test: htmltest jstest doctest

htmltest:
	html5validator --root . --show-warnings --ignore '"datetime-local" input'

jstest:
	jshint --extract auto *.html
	jshint jquery.jsparc.js jsparc.js event-display/code.js scripts/regression.js scripts/leaflet.hisparc.js

doctest:
	sphinx-build -anW doc doc/_build/html
