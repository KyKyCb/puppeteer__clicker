require("dotenv").config();
const puppeteer = require("puppeteer");
const dappeteer = require("@chainsafe/dappeteer");

const elementFinder = async (
    page,
    parentBlockClass = "",
    childNodeTagName = "",
    deepChildNodeTagName = "",
    deepChildNodeInnerText = ""
) => {
    const options = {
        parent: parentBlockClass,
        childTag: childNodeTagName,
        deepChildTag: deepChildNodeTagName,
        innerText: deepChildNodeInnerText,
    };
    const findIndex = await page.evaluate((options) => {
        const parent = document.querySelector("." + options.parent);
        const elements = parent.querySelectorAll(`${options.childTag}`);

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const deepChildNode = element.querySelector(
                `${options.deepChildTag}`
            );

            if (deepChildNode?.innerText.toLowerCase() === options.innerText) {
                return i;
            }
        }
        return 0;
    }, options);

    const findElement = (
        await (await page.$(`.${options.parent}`)).$$(`${options.childTag}`)
    )[findIndex];

    const deepFindEl = await findElement.$(`${options.deepChildTag}`);

    return deepFindEl;
};

const connectWallet = async (page, metamask) => {
    // const elementIndex = await page.evaluate(() => {
    //     // const elements = document.querySelectorAll(".NavItem--isRoot");

    //     // for (let i = 0; i < elements.length; i++) {
    //     //     const element = elements[i];
    //     //     let wallet = element.querySelector("i");

    //     //     if (wallet?.innerText === "menu") {
    //     //         return i;
    //     //     }
    //     // }
    //     return 0;
    // });

    console.log("element index ", 0);

    const button = (await page.$$(".NavItem--isRoot"))[0];

    await button?.click();

    const connectButton = await elementFinder(
        page,
        "NavMobile--menu",
        "li",
        "button",
        "connect wallet"
    );

    // console.log("connect button ", connectButton);

    await connectButton?.click();

    const metamaskButton = await elementFinder(
        page,
        "ConnectCompatibleWallet--wallet-list",
        "li",
        "span",
        "metamask"
    );

    // console.log("metamask button ", metamaskButton);

    await metamaskButton?.click();

    await metamask.approve()
};

async function main() {
    const browser = await dappeteer.launch(puppeteer, {
        metamaskVersion: "v10.8.1",
    });

    const metamask = await dappeteer.setupMetamask(browser, {
        seed: process.env.WALLET_SEED_PHRASE,
    });

    // const metamask = null

    const options = {
        networkName: process.env.BLOCKCHAIN_NETWORK_NAME,
        rpc: process.env.BLOCKCHAIN_NETWORK_RPC,
        chainId: process.env.BLOCKCHAIN_NETWORK_CHAIN_ID,
    };
    await metamask.addNetwork(options);

    const page = await browser.newPage();

    // await page.goto(process.env.OPENSEA_URL);
    await page.goto(process.env.OPENSEA_URL);

    await page.waitForTimeout(10000);

    // await connectWallet(page, metamask);

    // await page.bringToFront();
}

main();
