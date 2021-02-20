pragma solidity ^0.6.12;

library IterableCollection {
    struct Collection {
        address[] values;
        mapping(address => uint) indexOf;
        mapping(address => bool) inserted;
    }

    function getValue(Collection storage collection, address index) public view returns (uint) {
        return collection.values[index];
    }

    function getIndex(Collection storage collection, uint value) public view returns (address) {
        return collection.indexOf[value];
    }

    function size(Collection storage collection) public view returns (uint) {
        return collection.values.length;
    }

    function add(Collection storage collection, address value) public {
        if (collection.inserted[value]) {
            return;
        } else {
            collection.inserted[value] = true;
            collection.indexOf[value] = collection.keys.length;
            collection.keys.push(value);
        }
    }

    function remove(Collection storage collection, address value) public {
        if (!collection.inserted[key]) {
            return;
        }

        uint index = collection.indexOf[value];
        uint lastIndex = collection.values.length - 1;
        address lastValue = collection.values[lastIndex];

        collection.indexOf[lastValue] = index;
        delete collection.indexOf[value];

        collection.values[index] = lastValue;
        collection.values.pop();
    }
}