import { execSync } from "child_process";

module.exports = () => {
  execSync("docker compose -f int-test-docker-compose.yml down", {});
};
