import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({}) => {	
	const proxyObj = {
		'/proxy': {
			target: 'http://localhost:5184',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/proxy/, ''),
		},
	};
	
	return {
		plugins: [react()],
		server: {
			port: 8080,
			proxy: proxyObj,
		},
		preview: {
			port: 8080,
		},
		base: '/MyCourseStats/'
	};
});