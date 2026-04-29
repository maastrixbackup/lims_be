ALTER TABLE plots
MODIFY COLUMN displaced_affected_project VARCHAR(255) NULL;

ALTER TABLE khatas
MODIFY COLUMN displaced_affected_project VARCHAR(255) NULL;
