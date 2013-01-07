DIR_MODULES=node_modules
MAIN_JS=src/main.js
RUNNER_JS=node_modules/supervisor/lib/cli-wrapper.js

all : install server

server : ;
	export NODE_PATH=.; \
	node ${RUNNER_JS} ${MAIN_JS}

install : ;
	npm install

clean : ;
	rm -rf ${DIR_MODULES}
