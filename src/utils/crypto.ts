var hash = require("object-hash");
export function generateJsonHash(json: object): string {
  return hash.sha1(json);
}
