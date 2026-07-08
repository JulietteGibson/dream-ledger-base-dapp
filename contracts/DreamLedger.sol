// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DreamLedger {
    uint256 public nextDreamId = 1;

    struct DreamEntry {
        address dreamer;
        string title;
        string mood;
        string place;
        string fragment;
        uint256 createdAt;
    }

    mapping(uint256 => DreamEntry) private dreams;

    event DreamSaved(
        uint256 indexed dreamId,
        address indexed dreamer,
        string title,
        string mood
    );

    function saveDream(
        string calldata title,
        string calldata mood,
        string calldata place,
        string calldata fragment
    ) external returns (uint256 dreamId) {
        require(bytes(title).length > 0 && bytes(title).length <= 42, "Invalid title");
        require(bytes(mood).length > 0 && bytes(mood).length <= 18, "Invalid mood");
        require(bytes(place).length > 0 && bytes(place).length <= 42, "Invalid place");
        require(bytes(fragment).length > 0 && bytes(fragment).length <= 220, "Invalid fragment");

        dreamId = nextDreamId++;
        dreams[dreamId] = DreamEntry({
            dreamer: msg.sender,
            title: title,
            mood: mood,
            place: place,
            fragment: fragment,
            createdAt: block.timestamp
        });

        emit DreamSaved(dreamId, msg.sender, title, mood);
    }

    function getDream(
        uint256 dreamId
    )
        external
        view
        returns (
            address dreamer,
            string memory title,
            string memory mood,
            string memory place,
            string memory fragment,
            uint256 createdAt
        )
    {
        DreamEntry storage entry = dreams[dreamId];
        return (
            entry.dreamer,
            entry.title,
            entry.mood,
            entry.place,
            entry.fragment,
            entry.createdAt
        );
    }
}
