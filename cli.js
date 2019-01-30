#!/usr/bin/env node

const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const feedRead = require ("davefeedread");
const fs = require('fs');

const blogFeedWikiURL = 'https://wiki.cdot.senecacollege.ca/wiki/Planet_CDOT_Feed_List';
const timeOutSecs = 20;

axios
    .get(blogFeedWikiURL)
    .then(response => new JSDOM(response.data))
    .then(dom => Promise.resolve(dom.window.document.querySelector('pre')))
    .then(pre => pre.innerHTML)
    .then(html => html.split(/\r?\n/))
    .then(lines => {
        const feedDetails = [];

        for(let i = 0, len = lines.length, line; i < len; i++) {
            line = lines[i];

            // Skip empty lines
            if(line.match(/^\s*$/)) {
                continue;
            }

            /**
             * We expect to see something like this across 2 lines:
             * 
             * [https://...blog feed url...]
             * name = My Name
             */

            let urlMatch = line.match(/^\s*\[(https?:\/\/[^\]]+)\]/);
            if(urlMatch) {
                let url = urlMatch[1];

                // Advance to next line and get name=...
                i++;
                line = lines[i];

                let nameMatch = line.match(/\s*name\s*=\s*([^$]+)$/);
                if(nameMatch) {
                    let name = nameMatch[1];

                    feedDetails.push({
                        url,
                        name: name.trim()
                    });
                } else {
                    console.warn('Expected to get name after feed URL!', line);
                }
            }
        }
        
        return feedDetails;
    })
    .then(feeds => {
        var workingFeeds = [];
        var failingFeeds = [];

        return Promise.all(feeds.map(feed => new Promise(resolve => {  
            const url = feed.url;

            feedRead.parseUrl (url, timeOutSecs, err => { 
                if(err) {
                    feed.reason = `Feed excluded, error was: ${err.message}`;
                    failingFeeds.push(`#${feed.reason}\n#[${feed.url}]\n#name=${feed.name}\n\n`);
                    console.log(`FAIL - ${url} - ${err.message}`);
                } else {
                    workingFeeds.push(`[${feed.url}]\nname=${feed.name}\n\n`);
                    console.log(`GOOD - ${url}`);
                }

                resolve();
            });
        }))).then(() => {
            let feedList = '################# Failing Feeds Commented Out [Start] #################\n\n' +
                            failingFeeds.join('\n') +
                            '################# Failing Feeds Commented Out [End] #################\n\n' +
                            workingFeeds.join('\n');

            fs.writeFile('./cleaned-planet-list.txt', feedList, (err) => {
                if(err) {
                    console.error('Unable to save feed list', err)
                } else {
                    console.log(`Processed ${workingFeeds.length + failingFeeds.length} feeds into ./cleaned-planet-list.txt, with ${failingFeeds.length} failing and commented out.`);
                }
            });
        });
    })
    .catch(err => console.error(err));
