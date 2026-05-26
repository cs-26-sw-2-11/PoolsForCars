import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            enabled: true,
            clean: false,
            cleanOnRerun: false,
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.test.ts"],
            reportsDirectory: "./coverage_output",
        },
        include: ["src/**/*.test.ts"],
        exclude: [
            ...configDefaults.exclude,
            "packages/template/*",
            "**/dist/**",
        ],
        reporters: "verbose",
    },
});
