// vite.config.mts
import { defineConfig } from "file:///E:/Nexora-ERP-Admin-Panel/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Nexora-ERP-Admin-Panel/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgrPlugin from "file:///E:/Nexora-ERP-Admin-Panel/node_modules/vite-plugin-svgr/dist/index.js";
import tsconfigPaths from "file:///E:/Nexora-ERP-Admin-Panel/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react"
    }),
    tsconfigPaths({
      parseNative: false
    }),
    svgrPlugin(),
    {
      name: "custom-hmr-control",
      handleHotUpdate({ file, server }) {
        if (file.includes("src/app/configs/")) {
          server.ws.send({
            type: "full-reload"
          });
          return [];
        }
      }
    }
  ],
  build: {
    outDir: "dist"
  },
  server: {
    // open: true,
    host: true,
    // strictPort:true,
    port: 3e3
  },
  define: {
    global: "window"
  },
  resolve: {
    alias: {
      "@": "/src",
      "@fuse": "/src/@fuse",
      "@history": "/src/@history",
      "@lodash": "/src/@lodash",
      "@mock-api": "/src/@mock-api",
      "@schema": "/src/@schema",
      "app/store": "/src/app/store",
      "app/shared-components": "/src/app/shared-components",
      "app/configs": "/src/app/configs",
      "app/theme-layouts": "/src/app/theme-layouts",
      "app/AppContext": "/src/app/AppContext"
    }
  },
  optimizeDeps: {
    include: [
      "@mui/icons-material",
      "@mui/material",
      "@mui/base",
      "@mui/styles",
      "@mui/system",
      "@mui/utils",
      "@emotion/cache",
      "@emotion/react",
      "@emotion/styled",
      "lodash"
    ],
    exclude: [],
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcTmV4b3JhLUVSUC1BZG1pbi1QYW5lbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcTmV4b3JhLUVSUC1BZG1pbi1QYW5lbFxcXFx2aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L05leG9yYS1FUlAtQWRtaW4tUGFuZWwvdml0ZS5jb25maWcubXRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHN2Z3JQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHBsdWdpbnM6IFtcblx0XHRyZWFjdCh7XG5cdFx0XHRqc3hJbXBvcnRTb3VyY2U6ICdAZW1vdGlvbi9yZWFjdCdcblx0XHR9KSxcblx0XHR0c2NvbmZpZ1BhdGhzKHtcblx0XHRcdHBhcnNlTmF0aXZlOiBmYWxzZVxuXHRcdH0pLFxuXHRcdHN2Z3JQbHVnaW4oKSxcblx0XHR7XG5cdFx0XHRuYW1lOiAnY3VzdG9tLWhtci1jb250cm9sJyxcblx0XHRcdGhhbmRsZUhvdFVwZGF0ZSh7IGZpbGUsIHNlcnZlciB9KSB7XG5cdFx0XHRcdGlmIChmaWxlLmluY2x1ZGVzKCdzcmMvYXBwL2NvbmZpZ3MvJykpIHtcblx0XHRcdFx0XHRzZXJ2ZXIud3Muc2VuZCh7XG5cdFx0XHRcdFx0XHR0eXBlOiAnZnVsbC1yZWxvYWQnXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRdLFxuXHRidWlsZDoge1xuXHRcdG91dERpcjogJ2Rpc3QnXG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdC8vIG9wZW46IHRydWUsXG5cdFx0aG9zdDogdHJ1ZSxcblx0XHQvLyBzdHJpY3RQb3J0OnRydWUsXG5cdFx0cG9ydDogMzAwMFxuXHR9LFxuXHRkZWZpbmU6IHtcblx0XHRnbG9iYWw6ICd3aW5kb3cnXG5cdH0sXG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0J0AnOiAnL3NyYycsXG5cdFx0XHQnQGZ1c2UnOiAnL3NyYy9AZnVzZScsXG5cdFx0XHQnQGhpc3RvcnknOiAnL3NyYy9AaGlzdG9yeScsXG5cdFx0XHQnQGxvZGFzaCc6ICcvc3JjL0Bsb2Rhc2gnLFxuXHRcdFx0J0Btb2NrLWFwaSc6ICcvc3JjL0Btb2NrLWFwaScsXG5cdFx0XHQnQHNjaGVtYSc6ICcvc3JjL0BzY2hlbWEnLFxuXHRcdFx0J2FwcC9zdG9yZSc6ICcvc3JjL2FwcC9zdG9yZScsXG5cdFx0XHQnYXBwL3NoYXJlZC1jb21wb25lbnRzJzogJy9zcmMvYXBwL3NoYXJlZC1jb21wb25lbnRzJyxcblx0XHRcdCdhcHAvY29uZmlncyc6ICcvc3JjL2FwcC9jb25maWdzJyxcblx0XHRcdCdhcHAvdGhlbWUtbGF5b3V0cyc6ICcvc3JjL2FwcC90aGVtZS1sYXlvdXRzJyxcblx0XHRcdCdhcHAvQXBwQ29udGV4dCc6ICcvc3JjL2FwcC9BcHBDb250ZXh0J1xuXHRcdH1cblx0fSxcblx0b3B0aW1pemVEZXBzOiB7XG5cdFx0aW5jbHVkZTogW1xuXHRcdFx0J0BtdWkvaWNvbnMtbWF0ZXJpYWwnLFxuXHRcdFx0J0BtdWkvbWF0ZXJpYWwnLFxuXHRcdFx0J0BtdWkvYmFzZScsXG5cdFx0XHQnQG11aS9zdHlsZXMnLFxuXHRcdFx0J0BtdWkvc3lzdGVtJyxcblx0XHRcdCdAbXVpL3V0aWxzJyxcblx0XHRcdCdAZW1vdGlvbi9jYWNoZScsXG5cdFx0XHQnQGVtb3Rpb24vcmVhY3QnLFxuXHRcdFx0J0BlbW90aW9uL3N0eWxlZCcsXG5cdFx0XHQnbG9kYXNoJ1xuXHRcdF0sXG5cdFx0ZXhjbHVkZTogW10sXG5cdFx0ZXNidWlsZE9wdGlvbnM6IHtcblx0XHRcdGxvYWRlcjoge1xuXHRcdFx0XHQnLmpzJzogJ2pzeCdcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtUSxTQUFTLG9CQUFvQjtBQUNoUyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxtQkFBbUI7QUFHMUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0wsaUJBQWlCO0FBQUEsSUFDbEIsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLE1BQ2IsYUFBYTtBQUFBLElBQ2QsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLElBQ1g7QUFBQSxNQUNDLE1BQU07QUFBQSxNQUNOLGdCQUFnQixFQUFFLE1BQU0sT0FBTyxHQUFHO0FBQ2pDLFlBQUksS0FBSyxTQUFTLGtCQUFrQixHQUFHO0FBQ3RDLGlCQUFPLEdBQUcsS0FBSztBQUFBLFlBQ2QsTUFBTTtBQUFBLFVBQ1AsQ0FBQztBQUNELGlCQUFPLENBQUM7QUFBQSxRQUNUO0FBQUEsTUFDRDtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTixRQUFRO0FBQUEsRUFDVDtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFUCxNQUFNO0FBQUE7QUFBQSxJQUVOLE1BQU07QUFBQSxFQUNQO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sS0FBSztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLE1BQ1osV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IsV0FBVztBQUFBLE1BQ1gsYUFBYTtBQUFBLE1BQ2IseUJBQXlCO0FBQUEsTUFDekIsZUFBZTtBQUFBLE1BQ2YscUJBQXFCO0FBQUEsTUFDckIsa0JBQWtCO0FBQUEsSUFDbkI7QUFBQSxFQUNEO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDYixTQUFTO0FBQUEsTUFDUjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Q7QUFBQSxJQUNBLFNBQVMsQ0FBQztBQUFBLElBQ1YsZ0JBQWdCO0FBQUEsTUFDZixRQUFRO0FBQUEsUUFDUCxPQUFPO0FBQUEsTUFDUjtBQUFBLElBQ0Q7QUFBQSxFQUNEO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
