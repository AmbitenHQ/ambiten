
export interface TemplateOptions {
  useTypeScript: boolean;
  useAmbiten: boolean;
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
   * Indicates whether to use Ambiten or Ambiten_core for MongoDB operations.
   * Defaults to Ambiten_core (recommended).
   */
  useAmbiten: boolean;
  /**
   * Indicates whether to use TypeScript or JavaScript.
   * Defaults to TypeScript (recommended).
   * This is a boolean value.
   * If true, TypeScript will be used; otherwise, JavaScript will be used.
   * This is a boolean value.
   */
  useTypeScript: boolean;
  /**
   * Indicates whether to include Ambiten_Utils (helper APIs) in the project.
   * Defaults to true.
   */
  includeLogger: boolean;

}