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

function filterAndSortTags(tags) {
    const re = /^[0-9]+\.[0-9]+\.[0-9]+$/g;
    tags = tags.filter(tag => re.test(tag));
    tags = tags.sort(semver.rcompare);
    return tags
}

(async () => {
    let baseTags = (await fetchTags(BaseRepo))["tags"];
    baseTags = filterAndSortTags(baseTags);

    let ourLatestTag = "0.0.0";
    try {
        let ourTags = (await fetchTags(OurRepo))["tags"];
        ourTags = filterAndSortTags(ourTags);
        ourLatestTag = ourTags[0];
        console.log(`Latest tag of ${OurRepo} is ${ourLatestTag}`)
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
