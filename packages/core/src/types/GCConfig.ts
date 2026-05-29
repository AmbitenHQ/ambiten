export type GCConfig = {
  ttlField: string;
  expiresIn: string; 
  softDelete?: boolean;
  archiveBeforeDelete?: boolean;
};
