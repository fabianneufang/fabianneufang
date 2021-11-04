const axios = require("axios");
const fs = require('fs');

const arabicToRoman = (number) => {
  const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let romanNumeral = "";

  for (const key in romanNumerals) {
    while (number >= romanNumerals[key]) {
      romanNumeral += key;
      number -= romanNumerals[key];
    }
  }

  return romanNumeral;
};

function request(data, headers) {
  return axios({
    url: "https://api.github.com/graphql",
    method: "post",
    headers,
    data,
  });
}

const fetcher = (variables, token) => {
  return request(
    {
      query: `
      query userInfo($login: String!) {
        user(login: $login) {
          name
          login
          contributionsCollection {
            totalCommitContributions
            restrictedContributionsCount
          }
        }
      }
      `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

fs.readFile("./README_blueprint.md", async (err, blueprint) => {
    if (err) throw err;
    
    const res = await fetcher({ login: "fabianneufang" }, "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")
    let totalCommits = res.data.data.user.contributionsCollection.totalCommitContributions
    totalCommits += res.data.data.user.contributionsCollection.restrictedContributionsCount

    const inspirobot = await axios.get("https://inspirobot.me/api?generate=true")
    
    const readme = blueprint.toString()
    .replace("{{TOTALCOMMITS}}", arabicToRoman(totalCommits))
    .replace("{{INSPIROBOT}}", inspirobot.data)
    
    fs.writeFile("./README.md", readme, (err) => {
        if (err) throw err;
        console.log("README.md updated!");
    });
})