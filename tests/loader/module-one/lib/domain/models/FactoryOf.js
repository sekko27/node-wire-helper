class FactoryOf {
    constructor(value) {
        this.value = value;
    }

    $awareOf() {
        return [
            'awareRef',
            {prop: 'a', ref: 'awareRef2'}
        ];
    }
}

module.exports = FactoryOf;
