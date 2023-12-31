// // SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.8.14;

// import "forge-std/console.sol";
// import "ds-test/test.sol";
// import "forge-std/Vm.sol";
// import "forge-std/Test.sol";

// import "openzeppelin-contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

// import "src/bridge/Bridge.sol";
// import "src/amb/SourceAMB.sol";
// import "src/amb/TargetAMB.sol";
// import "src/bridge/Tokens.sol";
// import "test/amb/LightClientMock.sol";

// contract BridgeTest is Test {
// 	using stdStorage for StdStorage;

// 	function setUp() public {
// 	}

//     function testDeposit() public {
//         address dummyForeignLC = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         address dummyWithdraw = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         address dummyForeign = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         SourceAMB home = new SourceAMB();
// 		Deposit deposit = new Deposit(home, dummyWithdraw, uint16(100));
// 		ERC20 token = new ERC20PresetFixedSupply("GigaBrainToken", "GBT", 1000000, address(this));
// 		deposit.setMapping(address(token), address(token)); 
//         token.approve(address(deposit), 5);
//         address depositRecipient = 0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519;
//         (bool success, bytes memory data) = address(deposit).call{value: 1000000000000000}(
//             abi.encodeWithSignature(
//                 "deposit(address,uint256,address)",
//                 depositRecipient,
//                 5,
//                 address(token)
//             )
//         );
//         require(success);
//         bytes32 sentMsgHash = home.messages(1);
//         assertEq(sentMsgHash != bytes32(0), true);
//         address eoa = 0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5;
//         deposit.transferOwnership(eoa);
//         vm.prank(eoa);
//         deposit.claimFees();
//         assertEq(eoa.balance, 1000000000000000);
//     }

//     function testMint() public {
//         IERC20Ownable mytoken = new InfiniteMintSuccincts();
//         uint256 balance = mytoken.balanceOf(address(this));
//         assertEq(balance, 0);
//         mytoken.mint(address(this), 100);
//         uint256 balance2 = mytoken.balanceOf(address(this));
//         assertEq(balance2, 100);
//     }

//     function testMockDeposit() public {
//         address dummyForeignLC = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         address dummyWithdraw = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         address dummyForeign = address(0xb44ea27353D96890CB6adD8D5F7De6837bD3322a);
//         SourceAMB home = new SourceAMB();
// 		DepositMock deposit = new DepositMock(home, dummyWithdraw, uint16(100));
//         deposit.setMapping(address(0), address(1));
//         deposit.deposit(address(this), 5, address(0));
//     }

// 	function testWithdraw() public {
//         // This is to test the withdraw function.
//         // These proofs are generated by using the get_proof RPC with deployed
//         // mock deposit contract using scripts/MockDeposit.s.sol
//         // DO NOT FORGET to change BridgeMock to same code as Bridge.sol
//         // Instructions below:
//         // cd src/scripts; bash deploy_deposit_mock.sh
//         // change deployedDeposit address
//         // change deployedAMB address
//         // change proofs based on eth_getProof RPC, plugging in AMB address
//         // change block number & update execution state root

//         address deployedAMB = 0x42793dF05c085187E20aa99104A4E67e21823880;
//         address deployedDeposit = 0x6e57b45B57e84C964E7CdFF596ed02E0387D617e; // NOTE this must be changed with deployed deposit
//         LightClientMock homeLC = new LightClientMock();
//         vm.chainId(100); // Want to deploy AMB and withdraw on Gnosis chain
//         TargetAMB foreign = new TargetAMB(address(homeLC), deployedAMB);
// 		Withdraw withdraw = new Withdraw(address(foreign), deployedDeposit);
//         // This needs to be set properly in MockDeposit.s.sol
//         // for the message to be processed by the deployed withdraw contract in this test.
//         // Note that the address always remains the same as long as withdraw is deployed
//         // in the same order.
//         // console.logAddress(address(withdraw));
//         // 0xEFc56627233b02eA95bAE7e19F648d7DcD5Bb132

//         IERC20Ownable succinctToken = withdraw.token();
//         address depositTokenAddress = 0x0b7108E278c2E77E4e4f5c93d9E5e9A11AC837FC;
//         address depositRecipient = 0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519;
//         withdraw.setMapping(depositTokenAddress, depositTokenAddress);
//         {
//             uint256 balance = succinctToken.balanceOf(depositRecipient);
//             assertEq(balance, 0);
//         }

//         bytes memory message;

//         {
//             uint256 depositAmount = 100;
//             bytes memory msgData = abi.encode(depositRecipient, depositAmount, depositTokenAddress);
//             address receiverHardcode = 0xEFc56627233b02eA95bAE7e19F648d7DcD5Bb132; // NOTE this must match WITHDRAW_ADDRESS in MockDeposit.s.sol
//             uint256 gasLimit = 50000;
//             message = abi.encode(uint256(0), deployedDeposit, receiverHardcode, uint16(100), uint256(gasLimit), msgData);
//         }
//         // These proofs are generated using the get_proof RPC. The function call is below.
//         // The 2nd argument is keccack(abi.encode(uint256(0), uint256(0))) as that is the storage slot of 0-th nonce sent message
//         // Last argument is the slot number converted to hex.
//         // {"id":1,"jsonrpc":"2.0","method":"eth_getProof","params":[AMB_ADDRESS,["0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5"],"0x752B30"]}
//         {
//             bytes[] memory accountProof = new bytes[](8);
//             accountProof[
//                 0
//             ] = hex"f90211a0bd22c40d470b1116c36202a184436aa5aab6c00ca1a961900e8e802a71ebc016a0640b6be0b038321db7adb2788ac8d2afa9b82644d1323e9a690a8c8905c84b81a09685b78246e3c4fb28fee6887b05721dd3efeec51e992c0c6cf3ff679ea67659a07cdfb02afbfb361cdcc5cba88e0a773257fac4e477aa08515eb0e7e1700e2acfa0e9efd828dcee422dff33bd46e6364e8dc8aa5af0b76b17c63c40d115f52dfae3a0cfb1e72c4e93b2eeba55cd6564eb7f6c559bbf4c954a389e672ff09c79ffc481a07f2ee1c2c4667331edf0dd1ab8690a881bbd6d68353693abd9bc55938e95cd72a054907b454ef211ed5adf3203a9aa2a9c849ca4baaf58b8f2334648505fba692ca08c93fbe97344f0cf47249647ff7beabfec348061f2c5db8b06b9c6a13cac101ea0abd596736f9913747b2a69f225722d18908dfed5f9419d387dbf0cd3bb3bddaaa0f27a021fb25be936a98a223f3bec33d5a140a74c5f2964b27a62a356f3d3e276a0cec4e89b4dfaf8b154b417e867c3643bb2afb8db60efbdddb0c20f3a840680daa03948666abaa305cb7626aa2c7aa7eb94542397f90f1da9efdbd1ffdbecabff71a0f07a043deea9261111b3a52a447cbbba793bdcea0120e71cd3d41773d7184bcda0b9037b5bbf47b313ce0b1c7fc9cd6f7301ee294afad112d44fc74ed7f868ade6a069c9e1d7fddbace686fce8c137e6bbed47ec66f63744e29d18623ffe60aa556b80";
//             accountProof[
//                 1
//             ] = hex"f90211a0eb8689a3af3d3605b0c4d84c938b6c3203689b6134638f72b61cefcaa4de754ea0ed7d0c3edc6c617ea7af84fb656a50b0fbd1fcaf7b53cbb9d5ffdf5709776204a0b6de9b4840d4664aaa0f732f625c8385d485486d5e670fbc1155ec76d69528bca05cd9120ea2694c7d4fe2da43b2fb8377b25778905b5f3d807b885a3521b1a842a05223f018434c4cc725bebc30f93966b2a98392761356fbb99b886f861a632e17a0bdeb5d6958e4a32f819bea257a88af52e66cf8baff573981a916185f9e8f628aa0e0d36008579e4cb8a3de0cfdf388342028c60fd0cfaba41b61a8db96024dd1dba04d353c936a99c43465149b861e0a30cb2c08f2ecb313e7ac645d00fa2b695a1ea0bddcbb4bf6d5b9b3537233cb226157bbdce7d81578f42f228817d925fbe5d1e0a0d419390bdcd6299ffabf3a9c0ed7578049edb83ed700b9889db15a9aa1138708a07ea1ad8c9bcfc39d81370fac138a6c7377024c7f50ffdfbb3d841f018312aed8a03bbc52e2af4c9debb3a111be91443088230df2d8a85c937e6846e20de5ca2ddba07fcc52ac80657a319abb49b884cb684ece2e5df75e246d003688528b50c70754a0dad344da7363136cdc4a6c288e9813de3366ebefbee6b45c4376ca0f2ca1bb02a003d38d3dd3e9a1abd92bc690d395137c9126a4ccf147299fe98037c3fd2d8189a07f4c223d0e3dc8a7e3f7a25495bf658f845f3248db2cbc3297219c47e21aaeae80";
//             accountProof[
//                 2
//             ] = hex"f90211a01d1d1a069a7d945cdd59b5d534007b86a0bf442e0b84db821f6a08b9aff50297a02ceea5fdcaef6fe30e23111547e76d23000c2fe61e75a1f49beb6c1b4490d6dca01dc05def808c9c9c817224b23f6501cc7bb3697d2583e4051949e7269198ca6fa09ae840e91873b2261baa0b2a2d22387c6dee64d67a8a33683159b04dcf7f0e79a02923b6ad6afbbf978fa0fd4c9506468ff17842555cf512dd024261b7c4479fd9a0dcefd73d55a4df5bfc6e57b0a14a81d28f691ddb04d8030cbb0fdafc3001406ea088ac07d43f386f3cbd5d7d75ea3e39ef0e9c2d6f37f1d5c9e8b53265bbe9e8fea0b87931ada8c2471a753e2fe8fb8a17a91ab909e52727dcb51a9b70dfb49ed61ca053146e4d5255a14304d7da96cc73aafaa17e675924429ecfa9e3923fc5f0dac2a07a3015774a754be07b396ed971e8b62f1c394adcfddc308ebeb5ef5c35c0de9ba06ab1086ac83c887424d9395c5189520079e09b06bca1a20a8d235b69bb5ce703a09108da53cf102a54091d6f7d7630670d6d41b45caab688201ec48e7b7d40e82da0323015275bcd6a518389c0bb213bf4b81a3516ce2748f49bf98c06987ab314d6a051e41dd6fc1986171f4b625976868b36035b676b0e4ca485828cc92654846001a0702d0f459df4ecf92ad5c3be48757a7c86b1b4f09ccdffa20ecc0b3ab58a5024a056a909d7910f39ef0f1286f892988d56e35da9de9a27b588c105034f48c7d0c080";
//             accountProof[
//                 3
//             ] = hex"f90211a0ba3bffbeac1d5f4ce36380494c7eaf06b54a96339b3ceb2178e0809d95460e6ea011612f67916d31b0c77c307395dd038d61c8617f1537df55c9f60819fa122422a01bb3d4e8106be4e549a28c1ca7b7c38e3ead19b14a2e884f72fae35437f98947a0258c7a55a4c628321ede483cd81bdcd1a86ceb87409da94fa626eae75b81babfa071523970a72203b1415f091610354bee24568050c3479d1cd84d3f79cb635fe5a0536ba529ca0822928624371ce6574cd7f80607000df51e5bf58acbdb5d964c5ba070351fee868445dc321a1148879225173e5a0e298aa7cb010ed4aead2cf4c7e0a0837dc8f363b0cd15a3b1602584763767807bdf101e20f624b64454281cdbfc5ca014d73b8a30b13409ff9bbf139e7e3affd87df0ab0dbdff0d3b0e0a7c2e90132ea0ed4a533f3f5adb1c67515b7b990dcbe644819e5f0f097c8b8765d2152a2f14ffa071af248c6244c198010f0772d8d50cbbd00617abebf711393cc50e5ded3fd467a000205353c44ca8fd5cc79715e9270ffb543a30af76a0897083c5a9282597a5e8a0302b41a82e169dbe0cf9830358f676128b62e86040641d123f702a57c60f25e3a07dd5ab6584de223c1677ad440d2938050dd68bf33735c9b3479b206830d7ce5aa05c09779cdccb26244d91fc236a323002f69e13210ef3fe7a87fac854f700a9e7a0ca3b34416c4e45ca98fc458af20d2fbf64d4a3e77e937527e3f9ecdf080138e880";
//             accountProof[
//                 4
//             ] = hex"f90211a0537c80d01107b3b8d77c8af13a1aa4977abb5e9432b1e9577b7944ebcb4789b8a03018e9c68f82f2e3e15d7025c36040b59b748641c756e61aa5b707667b4c198ca05490a3c1985b360e81142b9c37c2509d59a8f54fe83f1f62fa3bfe43f1b0e9d3a097425808ba81e3a5bae5af914a3dccff544a8155df31fc975cf4bd305b7e7057a0dd0b1cf013e29fc9308dedff649cb41ffc70aa2aad4f686d697a3fa47cd689cba087ca7df614c0d893d7415130caf3a759b9a3b53a43886e9e488fa9b6c3e575cda09f3138074a674909960c8b6e8a8b64e1a8a2ac294300420bced4dc9008ec4f5da081c19a27e5545118e117cf5375962d7540069b5aa0979655c245a7cf0335dfa6a0e219f7c32fedd932df671dec044efebb04add184a02f636d11528c5ed0960965a051307864184a9b66a7a6888bd2d45dd048ccc6db4a55c6ceedeb4c6bc6cc44bfa00e8c4f9db5a78b8d21b9c97b4afc1c046b63bd5160a08a9aa86f34787db40bb4a00afc75cd5407aeddd084210d94c79d9e8d0752aa9c56ea74c22a3a68f61b3a05a0d0417601a2b7c719bfa1ac4ee5521073e18ee4b0ee0bbf6a7dbc96b4a9994705a09174f245d3ab8f9d18db908319ab3c6b762248287c65648da01164a7a8c00592a023e8196f81d5aed4a40d5e24599816a5a19feae103df5a566b1e66ba631755c7a07b18d7e2bee75214816b93497ab684acce1c9a7fe697fcb56eaddc15c85b6baf80";
//             accountProof[
//                 5
//             ] = hex"f9015180a0b3ce95094b35aea747c8190a13462aea43255e4d08a952988f1d97628581efca80a0660135ecdbcbdf53a2198f0333d326bf2fb17960a6000557b227f459f81bfe0380a031b9dcbbcad33c01020599911c1ed757ab6b0d49228a4459bbfa94d80339060da044734df82ae270d87af981475fd23837dabb28a7879739c2f85d924028eee3d080a04da1ed2cf045a616ecaf43ef30bcf419994797bb215a17ff028e23fe2fc9e15ca0b3d8573a66233c6ae754ba61d280f4fc3687c2bdec9fc1735432d5d5cc2d5722a08e6fce89d24ffb3895de7f818d818e10ec056ff6d48e0ad25d3c8a165f1c5d4780a07588e634077653f50807b19f480f04fc85378ed2f4e7f30b00fad2bc8bfd16de80a0bbc62cfd324a6ed22e9c1157079eb6fae88147a5acd3424713380aac12e6f1cba0b8f56f816bcd4e1298d645629b47e4a908eef87ec0e81aee8e90b97e56d3a59080";
//             accountProof[
//                 6
//             ] = hex"f851a05b81664230936d2dba284dd9e92270c0b8d877ae8d7636dbba95853c6ac301628080808080a09d6a2409cb5e9c2f88037f1e8da7e2e21bfa53d9f6b8d0111a17779b294d140880808080808080808080";
//             accountProof[
//                 7
//             ] = hex"f8669d350a94beda7ef9dafcd2ff222f56afcfc32798df80e8cde4c41ee51569b846f8440180a050fc79aaf670adf9f0adff6a553fac0b733151c49fd644fef58b9e9fcfcd86caa082007db7125c87eb6d034ec37046d93a249333dfef349c8ee9b32c60e4999740";

//             bytes[] memory storageProof = new bytes[](3);
//             storageProof[
//                 0
//             ] = hex"f8d1a08857639e3944eefb53fc927fd82a371bd6fd6ada8f9fe9cbc2b6381c1aeb5fec808080a09d1bdeb37df185163f327bdb0f417cf2647a05e7039606f486f40acd85e12c3f808080a0604ee4f06b8ea3035e3dcf6528c50e5031f173dbb4bea06460aba082b25d47cb80a064a645f9186d0cd20a1085d7cfc14e82854de25ea3791f659e525cf55c90b88a80a0c04710f5601e4c5dcca343d823f7b00f3fc13d1463a7b4df32dbefdfe1e92c9d8080a0efcbf394e6c7ccec055497aa56de0120b5cc293360a816def7d92183849ab3dd80";
//             storageProof[1] = hex"f871a0aa52a12c3844bbac64e5555ae459dc59670a9699510aa43a59f11d066cf43de58080a0ac90845931326be2b79fbc687313c008be30b37e70a74583ff4bfc1703c08d7e8080a0199a703f1f0840573ca4690656c439076a2da9e34462724db6a7d6ba66e2a10d80808080808080808080";
//             storageProof[2] = hex"f843a020df3dcda05b4fbd9c655cde3d5ceb211e019e72ec816e127a59e7195f2cd7f5a1a058eb5267effef0b3d1ebbb7839c3a52db33dec8bd32116e22c9d65ed7df5a2e1";

//             uint64 sourceSlot = 7725990;
//             bytes32 executionRoot = bytes32(0xcb7cd7e3d6fcb9ed019eec76dd8483a7732e5e83b598586afd1308ba1ad9e962);
//             homeLC.setExecutionRoot(sourceSlot, executionRoot);

//             foreign.executeMessage(
//                 sourceSlot,
//                 message,
//                 accountProof,
//                 storageProof
//             );
//         }

//         uint256 balanceAfter = succinctToken.balanceOf(depositRecipient);
//         assertEq(balanceAfter, 100);
//     }
// }
