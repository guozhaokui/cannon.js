import TupleDictionary from '../src/utils/TupleDictionary';

export function set(test) {
    const t = new TupleDictionary();

    t.set(1,2,'lol');
    test.equal(t.data['1-2'],'lol');

    t.set(2,1,'lol2');
    test.equal(t.data['1-2'],'lol2');

    test.done();
}

export function get(test) {
    const t = new TupleDictionary();

    t.set(1,2,'1');
    t.set(3,2,'2');

    test.equal(t.data['1-2'],t.get(1,2));
    test.equal(t.data['1-2'],t.get(2,1));

    test.equal(t.data['2-3'],t.get(2,3));
    test.equal(t.data['2-3'],t.get(3,2));

    test.done();
}

export function reset(test) {
    const t = new TupleDictionary();
    const empty = new TupleDictionary();

    t.reset();
    t.set(1,2,'1');
    t.reset();
    test.deepEqual(t.data,empty.data);

    test.done();
}
