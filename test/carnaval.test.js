const test = require('ava');

const carnaval = require('../');
const Domain = carnaval.Domain;

class Thing extends Domain {
    get props() {
        return {
            name: 'string'
        };
    }
}

test('decode with providers', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().providers({
        upperCase: value => {
            return value.toUpperCase();
        }
    })
    .codecCustom({
        decode: (json, providers) => {
            return Promise.resolve()
            .then(() => {
                return new Thing({
                    name: providers.upperCase(json.name)
                });
            });
        }
    });

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name.toUpperCase());
    });
});

test('encode with providers', t => {
    const thing = new Thing({name: 'Shoes'});
    const codec = carnaval().providers({
        upperCase: value => {
            return value.toUpperCase();
        }
    })
    .codecCustom({
        encode: (object, providers) => {
            return {
                name: providers.upperCase(object.name)
            };
        }
    });

    return codec.encode(thing).then(json => {
        t.is(json.name, thing.name.toUpperCase());
    });
});

test('freeze with providers', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval()
    .providers({
        freeze: o => Promise.resolve(Object.freeze(o))
    })
    .afterDecode((object, providers) => providers.freeze(object))
    .codecForClass(Thing)
    .pick('name');

    return codec.decode(json).then(thing => {
        const error = t.throws(() => {
            thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});
