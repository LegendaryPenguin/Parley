// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Parley Stage Credential
/// @notice A soulbound (non-transferable) ERC-721 credential, minted to a learner
///         when they clear a stage in Parley. Each token is bound to the learner's
///         encrypted scene transcript on **0G Storage** (storageRoot) and the
///         grading model's attestation — i.e. the token's "data/intelligence" lives
///         on 0G, in the spirit of 0G's intelligent NFTs (INFTs). It is intentionally
///         soulbound: a language credential belongs to the human who earned it.
/// @dev    Minimal, dependency-free ERC-721 metadata implementation so it compiles
///         and deploys with no external libraries. Transfers revert (soulbound).
contract ParleyStageCredential {
    // ---- ERC-721 metadata ----
    string public constant name = "Parley Stage Credential";
    string public constant symbol = "PARLEY";

    struct Credential {
        address learner;
        string storageRoot;     // 0G Storage content root of the encrypted transcript
        bytes32 recordHash;     // keccak256 of the record (also anchored on-chain)
        string skill;           // the stage / learning skill, e.g. "Introductions"
        string language;        // target language code, e.g. "es"
        uint16 fluency;         // 0..100
        string model;           // attesting 0G Compute model id
        uint64 mintedAt;
    }

    uint256 public totalSupply;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => Credential) public credentialOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event StageCredentialMinted(
        address indexed learner,
        uint256 indexed tokenId,
        string skill,
        string storageRoot,
        bytes32 recordHash
    );

    /// @notice Mint a stage credential to `to`, bound to its 0G Storage record.
    function mintCredential(
        address to,
        string calldata storageRoot,
        bytes32 recordHash,
        string calldata skill,
        string calldata language,
        uint16 fluency,
        string calldata model
    ) external returns (uint256 tokenId) {
        require(to != address(0), "zero address");
        tokenId = ++totalSupply;
        _owners[tokenId] = to;
        _balances[to] += 1;
        credentialOf[tokenId] = Credential({
            learner: to,
            storageRoot: storageRoot,
            recordHash: recordHash,
            skill: skill,
            language: language,
            fluency: fluency,
            model: model,
            mintedAt: uint64(block.timestamp)
        });
        emit Transfer(address(0), to, tokenId);
        emit StageCredentialMinted(to, tokenId, skill, storageRoot, recordHash);
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "nonexistent token");
        return owner;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "zero address");
        return _balances[owner];
    }

    /// @notice On-chain JSON metadata; external_url points at the 0G-stored transcript.
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        Credential memory c = credentialOf[tokenId];
        require(c.learner != address(0), "nonexistent token");
        return string.concat(
            'data:application/json;utf8,{"name":"Parley \xC2\xB7 ', c.skill,
            '","description":"A verifiable language-learning credential. The encrypted scene transcript lives on 0G Storage; the grade came from a 0G Compute model.",',
            '"attributes":[{"trait_type":"Skill","value":"', c.skill,
            '"},{"trait_type":"Language","value":"', c.language,
            '"},{"trait_type":"Fluency","value":', _u(c.fluency),
            '},{"trait_type":"Model","value":"', c.model,
            '"}],"external_url":"https://storagescan-galileo.0g.ai/file?root=', c.storageRoot, '"}'
        );
    }

    function supportsInterface(bytes4 id) external pure returns (bool) {
        return
            id == 0x01ffc9a7 || // ERC-165
            id == 0x80ac58cd || // ERC-721
            id == 0x5b5e139f;   // ERC-721 Metadata
    }

    // ---- soulbound: transfers are disabled ----
    function transferFrom(address, address, uint256) external pure {
        revert("soulbound: non-transferable");
    }
    function safeTransferFrom(address, address, uint256) external pure {
        revert("soulbound: non-transferable");
    }
    function approve(address, uint256) external pure {
        revert("soulbound: non-transferable");
    }
    function setApprovalForAll(address, bool) external pure {
        revert("soulbound: non-transferable");
    }

    function _u(uint256 v) private pure returns (string memory) {
        if (v == 0) return "0";
        uint256 j = v;
        uint256 len;
        while (j != 0) { len++; j /= 10; }
        bytes memory b = new bytes(len);
        while (v != 0) { len--; b[len] = bytes1(uint8(48 + (v % 10))); v /= 10; }
        return string(b);
    }
}
