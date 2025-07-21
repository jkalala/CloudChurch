-- Migration: Add Postgres functions for resource tag management
CREATE OR REPLACE FUNCTION add_tag_to_resource(resource_id UUID, tag_value TEXT)
RETURNS SETOF resources AS $$
BEGIN
  UPDATE resources
  SET tags = array_append(tags, tag_value)
  WHERE id = resource_id AND NOT tags @> ARRAY[tag_value];
  RETURN QUERY SELECT * FROM resources WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION remove_tag_from_resource(resource_id UUID, tag_value TEXT)
RETURNS SETOF resources AS $$
BEGIN
  UPDATE resources
  SET tags = array_remove(tags, tag_value)
  WHERE id = resource_id AND tags @> ARRAY[tag_value];
  RETURN QUERY SELECT * FROM resources WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql; 