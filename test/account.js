const {singletons, BN, ether, expectRevert} = require("openzeppelin-test-helpers");

const Account = artifacts.require("Account");
const KeyManager = artifacts.require("SimpleKeyManager");
const UniversalReciverTester = artifacts.require("UniversalReciverTester");
const ExternalERC777UniversalReceiverTester = artifacts.require("ExternalERC777UniversalReceiverTester");

// Get key: keccak256('ERC725Type')
const ERC725Type_KEY = '0xee97c7dd2e734cf234c2ba0d83a74633e1ac7fc8a9fd779f8497a0109c71b993';
// Get key: keccak256('ERC725Account')
const ERC725Account_VALUE = '0xafdeb5d6e788fe0ba73c9eb2e30b8a4485e3a18fb31dd13e3b362f62a65c67a0';
// Get key: keccak256('LSP1UniversalReceiverAddress')
const UNIVERSALRECEIVER_KEY = '0x8619f233d8fc26a7c358f9fc6d265add217d07469cf233a61fc2da9f9c4a3205';
// keccak256("EXECUTOR_ROLE")
const EXECUTOR_ROLE = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
const ERC1271_MAGIC_VALUE = '0x1626ba7e';
const ERC1271_FAIL_VALUE = '0xffffffff';
const RANDOM_BYTES32 = "0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b";
const LSP1_ERC777TokensRecipient = "0x2352f13a810c120f366f70972476f743e16a9f2196b4b60037b84185ecde66d3";
const DUMMY_PRIVATEKEY = '0xcafecafe7D0F0EBcafeC2D7cafe84cafe3248DDcafe8B80C421CE4C55A26cafe';
// generate an account
const DUMMY_SIGNER = web3.eth.accounts.wallet.add(DUMMY_PRIVATEKEY);

contract("Account", accounts => {
    let erc1820;
    beforeEach(async function () {
        erc1820 = await singletons.ERC1820Registry(accounts[1]);
    });

    context("Accounts Deployment", async () => {
        it("Deploys correctly, and compare owners", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});

            const idOwner = await account.owner.call();

            assert.equal(idOwner, owner, "Addresses should match");
        });
    });

    context("ERC165", async () => {
        it("Supports ERC165", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const interfaceID = '0x01ffc9a7';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });
        it("Supports ERC725X", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const interfaceID = '0x44c028fe';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });
        it("Supports ERC725Y", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const interfaceID = '0x2bd57b73';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });
        it("Supports ERC1271", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const interfaceID = '0x1626ba7e';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });
        it("Supports LSP1", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const interfaceID = '0x6bb56a14';

            const result = await account.supportsInterface.call(interfaceID);

            assert.isTrue(result);
        });

        it("Has ERC725Type set to ERC725Account", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            assert.equal(await account.getData(ERC725Type_KEY), ERC725Account_VALUE);
        });
    });

    context("ERC1271", async () => {
        it("Can verify signature from owner", async () => {
            const owner = accounts[2];
            const account = await Account.new(DUMMY_SIGNER.address, {from: owner});
            const dataToSign = '0xcafecafe';
            const signature = DUMMY_SIGNER.sign(dataToSign);

            const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

            assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
        });
        it("Should fail when verifying signature from not-owner", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const dataToSign = '0xcafecafe';
            const signature = DUMMY_SIGNER.sign(dataToSign);

            const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

            assert.equal(result, ERC1271_FAIL_VALUE, "Should define the signature as invalid");
        });
    });

    context("Storage test", async () => {
        let account;
        let owner = accounts[2];
        let count = 1000000000;

        it("Create account", async () => {
            account = await Account.new(owner, {from: owner});

            assert.equal(await account.owner.call(), owner);
        });
        it("Store 32 bytes item 1", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("Store 32 bytes item 2", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("Store 32 bytes item 3", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("Store 32 bytes item 4", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.numberToHex(count++);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("Store a long URL as bytes item 5: https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD", async () => {
            let key = web3.utils.numberToHex(count++);
            let value = web3.utils.utf8ToHex('https://www.google.com/url?sa=i&url=https%3A%2F%2Ftwitter.com%2Ffeindura&psig=AOvVaw21YL9Wg3jSaEXMHyITcWDe&ust=1593272505347000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCKD-guDon-oCFQAAAAAdAAAAABAD');
            await account.setData(key, value, {from: owner});

            // console.log(value.length, value);

            assert.equal(await account.getData(key), value);
        });
        it("Store 32 bytes item 6", async () => {
            let key = web3.utils.numberToHex(count);
            let value = web3.utils.numberToHex(count);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("dataCount should be 7", async () => {
            // 7 because the ERC725Type ios already set by the ERC725Account implementation
            assert.equal(await account.dataCount(), 7);
        });
        it("Update 32 bytes item 6", async () => {
            let key = web3.utils.numberToHex(count);
            let value = web3.utils.numberToHex(count);
            await account.setData(key, value, {from: owner});

            assert.equal(await account.getData(key), value);
        });
        it("dataCount should be 7", async () => {
            // 7 because the ERC725Type ios already set by the ERC725Account implementation
            assert.equal(await account.dataCount(), 7);
        });
    });

    context("Interactions with Accounts contracts", async () => {
        const owner = accounts[3];
        const newOwner = accounts[5];
        let account = {};

        beforeEach(async () => {
            account = await Account.new(owner, {from: owner});
        });

        it("Uprade ownership correctly", async () => {
            await account.transferOwnership(newOwner, {from: owner});
            const idOwner = await account.owner.call();

            assert.equal(idOwner, newOwner, "Addresses should match");
        });

        it("Refuse upgrades from non-onwer", async () => {
            await expectRevert(
                account.transferOwnership(newOwner, {from: newOwner}),
                "Ownable: caller is not the owner"
            );
        });

        it("Owner can set data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const data = web3.utils.asciiToHex("Important Data");

            await account.setData(key, data, {from: owner});

            let fetchedData = await account.getData(key);

            assert.equal(data, fetchedData);
        });

        it("Fails when non-owner sets data", async () => {
            const key = web3.utils.asciiToHex("Important Data");
            const data = web3.utils.asciiToHex("Important Data");

            await expectRevert(
                account.setData(key, data, {from: newOwner}),
                "Ownable: caller is not the owner"
            );
        });

        it("Allows owner to execute calls", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            const destBalance = await web3.eth.getBalance(dest);

            await account.execute(OPERATION_CALL, dest, amount, "0x0", {
                from: owner
            });

            const finalBalance = await web3.eth.getBalance(dest);

            assert.isTrue(new BN(destBalance).add(amount).eq(new BN(finalBalance)));
        });

        it("Fails with non-owner executing", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            // send money to the account
            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            // try to move it away
            await expectRevert(
                account.execute(OPERATION_CALL, dest, amount, "0x0", {
                    from: newOwner
                }),
                "Ownable: caller is not the owner"
            );
        });

        // TODO test delegateCall

        it("Allows owner to execute create", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CREATE = 0x3;

            let receipt = await account.execute(OPERATION_CREATE, dest, '0', "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6", {
                from: owner
            });

            assert.equal(receipt.logs[1].event, 'ContractCreated');
        });

        it("Allows owner to execute create2", async () => {
            const dest = accounts[6];
            const amount = ether("10");
            const OPERATION_CREATE = 0x2;

            // deploy with added 32 bytes salt
            let receipt = await account.execute(OPERATION_CREATE, dest, '0', "0x608060405234801561001057600080fd5b506040516105f93803806105f98339818101604052602081101561003357600080fd5b810190808051906020019092919050505080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610564806100956000396000f3fe60806040526004361061003f5760003560e01c806344c028fe1461004157806354f6127f146100fb578063749ebfb81461014a5780638da5cb5b1461018f575b005b34801561004d57600080fd5b506100f96004803603608081101561006457600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190803590602001906401000000008111156100b557600080fd5b8201836020820111156100c757600080fd5b803590602001918460018302840111640100000000831117156100e957600080fd5b90919293919293905050506101e6565b005b34801561010757600080fd5b506101346004803603602081101561011e57600080fd5b81019080803590602001909291905050506103b7565b6040518082815260200191505060405180910390f35b34801561015657600080fd5b5061018d6004803603604081101561016d57600080fd5b8101908080359060200190929190803590602001909291905050506103d3565b005b34801561019b57600080fd5b506101a46104df565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146102a9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b600085141561030757610301848484848080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050610505565b506103b0565b60018514156103aa57600061035f83838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505061051d565b90508073ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a2506103af565b600080fd5b5b5050505050565b6000806000838152602001908152602001600020549050919050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610496576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260128152602001807f6f6e6c792d6f776e65722d616c6c6f776564000000000000000000000000000081525060200191505060405180910390fd5b806000808481526020019081526020016000208190555080827f35553580e4553c909abeb5764e842ce1f93c45f9f614bde2a2ca5f5b7b7dc0fb60405160405180910390a35050565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600080600083516020850186885af190509392505050565b60008151602083016000f0905091905056fea265627a7a723158207fb9c8d804ca4e17aec99dbd7aab0a61583b56ebcbcb7e05589f97043968644364736f6c634300051100320000000000000000000000009501234ef8368466383d698c7fe7bd5ded85b4f6"
                // 32 bytes salt
                + "cafecafecafecafecafecafecafecafecafecafecafecafecafecafecafecafe",
                {
                    from: owner
                }
            );

            // console.log(receipt.logs[0].args);

            assert.equal(receipt.logs[1].event, 'ContractCreated');
            assert.equal(receipt.logs[1].args.contractAddress, '0x7ffE4e82BD27654D31f392215b6b145655efe659');
        });
    }); //Context interactions

    context("Universal Receiver", async () => {
        it("Call account and check for 'UniversalReceiver' event", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});

            // use the checker contract to call account
            let checker = await UniversalReciverTester.new();
            let receipt = await checker.callImplementationAndReturn(
                account.address,
                RANDOM_BYTES32
            );

            // event should come from account
            assert.equal(receipt.receipt.rawLogs[0].address, account.address);
            // event signature
            assert.equal(receipt.receipt.rawLogs[0].topics[0], '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd');
            // from
            assert.equal(receipt.receipt.rawLogs[0].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            assert.equal(receipt.receipt.rawLogs[0].topics[2], RANDOM_BYTES32);
            // receivedData
            assert.equal(receipt.receipt.rawLogs[0].data, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000');
        });
        it("Call account and check for 'ReceivedERC777' event in external account", async () => {
            const owner = accounts[2];
            const account = await Account.new(owner, {from: owner});
            const externalUniversalReceiver = await ExternalERC777UniversalReceiverTester.new({from: owner});

            // set account2 as new receiver for account1
            await account.setData(UNIVERSALRECEIVER_KEY, externalUniversalReceiver.address, {from: owner});

            // use the checker contract to call account
            let checker = await UniversalReciverTester.new();
            let receipt = await checker.callImplementationAndReturn(
                account.address,
                LSP1_ERC777TokensRecipient
            );


            // event signature "event ReceivedERC777(address indexed token, address indexed _operator, address indexed _from, address _to, uint256 _amount)"
            // event should come from account externalUniversalReceiver
            assert.equal(receipt.receipt.rawLogs[0].address, externalUniversalReceiver.address);
            // signature
            assert.equal(receipt.receipt.rawLogs[0].topics[0], '0xdc38539587ea4d67f9f649ad9269646bab26927bad175bdcdfdab5dd297d5e1c');
            // "token" is the checker
            assert.equal(receipt.receipt.rawLogs[0].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            // not present, as it would revert if not correct
            // receivedData
            assert.equal(receipt.receipt.rawLogs[0].data, '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');


            // event signature "event UniversalReceiver(address indexed from, bytes32 indexed typeId, bytes32 indexed returnedValue, bytes receivedData)"
            // event should come from account account
            assert.equal(receipt.receipt.rawLogs[1].address, account.address);
            // signature
            assert.equal(receipt.receipt.rawLogs[1].topics[0], '0x54b98940949b5ac0325c889c84db302d4e18faec431b48bdc81706bfe482cfbd');
            // "from" is the checker
            assert.equal(receipt.receipt.rawLogs[1].topics[1], web3.utils.leftPad(checker.address.toLowerCase(), 64));
            // typeId
            assert.equal(receipt.receipt.rawLogs[1].topics[2], LSP1_ERC777TokensRecipient);
            // receivedData
            assert.equal(receipt.receipt.rawLogs[1].data, '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000');

        });
    }); //Context Universal Receiver

    context("Using key manager as owner", async () => {
        let manager,
            account = {};
        const owner = accounts[6];

        beforeEach(async () => {
            account = await Account.new(owner, {from: owner});
            manager = await KeyManager.new(account.address, owner, {from: owner});
            await account.transferOwnership(manager.address, {from: owner});
        });

        it("Accounts should have owner as manager", async () => {
            const idOwner = await account.owner.call();
            assert.equal(idOwner, manager.address, "Addresses should match");
        });

        context("ERC1271 from KeyManager", async () => {
            it("Can verify signature from executor of keymanager", async () => {
                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                // add new owner to keyManager
                await manager.grantRole(EXECUTOR_ROLE, DUMMY_SIGNER.address, {from: owner});

                const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
            });
            it("Can verify signature from owner of keymanager", async () => {

                account = await Account.new(owner, {from: owner});
                manager = await KeyManager.new(account.address, DUMMY_SIGNER.address, {from: owner});
                await account.transferOwnership(manager.address, {from: owner});

                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                const result = await account.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_MAGIC_VALUE, "Should define the signature as valid");
            });
            it("Should fail when verifying signature from not-owner", async () => {
                const dataToSign = '0xcafecafe';
                const signature = DUMMY_SIGNER.sign(dataToSign);

                const result = await manager.isValidSignature.call(signature.messageHash, signature.signature);

                assert.equal(result, ERC1271_FAIL_VALUE, "Should define the signature as invalid");
            });
        });

        it("Key manager can execute on behalf of Idenity", async () => {
            const dest = accounts[1];
            const amount = ether("10");
            const OPERATION_CALL = 0x0;

            //Fund Accounts contract
            await web3.eth.sendTransaction({
                from: owner,
                to: account.address,
                value: amount
            });

            // Intial Balances
            const destBalance = await web3.eth.getBalance(dest);
            const idBalance = await web3.eth.getBalance(account.address);
            const managerBalance = await web3.eth.getBalance(manager.address);

            await manager.execute(OPERATION_CALL, dest, amount, "0x0", {
                from: owner
            });

            //Final Balances
            const destBalanceFinal = await web3.eth.getBalance(dest);
            const idBalanceFinal = await web3.eth.getBalance(account.address);
            const managerBalanceFinal = await web3.eth.getBalance(manager.address);

            assert.equal(
                managerBalance,
                managerBalanceFinal,
                "manager balance shouldn't have changed"
            );

            assert.isTrue(
                new BN(destBalance).add(amount).eq(new BN(destBalanceFinal)),
                "Destination address should have recived amount"
            );

            assert.isTrue(
                new BN(idBalance).sub(amount).eq(new BN(idBalanceFinal)),
                "Accounts should have spent amount"
            );
        });
    }); //Context key manager
});
