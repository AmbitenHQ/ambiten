// Global ambient declarations to help the editor/tsserver resolve site aliases
declare module '@site/*' {
	const value: any;
	export default value;
}

// Note: CSS module/type declarations are provided in the Docusaurus site types at
// `docs/website/src/types/css-modules.d.ts`. Keeping CSS module declarations
// only there avoids duplicate-declaration errors when the monorepo and website
// are both type-checked.
