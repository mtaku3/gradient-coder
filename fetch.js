const drc = require("docker-registry-client");
const semver = require("semver");
const core = require('@actions/core');

const BaseRepo = "codercom/code-server";
const OurRepo = "mtaku3/gradient-coder";

function fetchTags(repo) {
    return new Promise((resolve, reject) => {
        const client = drc.createClientV2({
            name: repo
        });
        client.listTags(function (err, tags) {
            if (err) {
                reject(err);
            } else {
                resolve(tags);
            }

            client.close();
        });
    });
}

(async () => {
    let baseTags = (await fetchTags(BaseRepo))["tags"];
    const re = /^[0-9]+\.[0-9]+\.[0-9]+$/g;
    baseTags = baseTags.filter(tag => re.test(tag));
    baseTags = baseTags.sort(semver.rcompare);

    let ourLatestTag = "0.0.0";
    try {
        const ourTags = (await fetchTags(OurRepo))["tags"];
        ourLatestTag = ourTags[0];
    } catch {
        // ignore
    }

    let tagsToBuild = [];
    for (let tag of baseTags) {
        if (semver.gt(tag, ourLatestTag)) {
            tagsToBuild.push(tag);
        } else {
            break
        }
    }
    tagsToBuild = tagsToBuild.sort(semver.compare);
    tagsToBuild = JSON.stringify(tagsToBuild, null, 4);

    console.log(tagsToBuild)
    core.setOutput("tags", tagsToBuild);
})();
