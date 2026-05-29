
export interface TemplateOptions {
  useTypeScript: boolean;
  useTenra: boolean;
  includeLogger: boolean;
}

/**

/**
 * Interface representing the choices for project generation.
 */
export interface ProjectChoices {
  /**
   * The type of project to generate.
   * Example values: 'MERN Stack', 'Next.js App', 'REST API', 'GraphQL API'.
   */
  projectType: string;

  /**
   * The name of the project to generate.
   */
  projectName: string;
  /**
   * Indicates whether to use Tenra or Tenra_core for MongoDB operations.
   * Defaults to Tenra_core (recommended).
   */
  useTenra: boolean;
  /**
   * Indicates whether to use TypeScript or JavaScript.
   * Defaults to TypeScript (recommended).
   * This is a boolean value.
   * If true, TypeScript will be used; otherwise, JavaScript will be used.
   * This is a boolean value.
   */
	useTypeScript: boolean;
	/**
	 * Indicates whether to include Tenra_Utils (helper APIs) in the project.
	 * Defaults to true.
	 */
  includeLogger: boolean;
  
}