import Vec3 from "../src/math/Vec3";
import Mat3 from "../src/math/Mat3";
import Quaternion from "../src/math/Quaternion";

export default {

    creation(test) {
        test.expect(1);

        const m = new Mat3();

        let success = true;
        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
                success = success && ( m.e( r , c ) == 0 );

        test.ok( success ,  "creation without paramaters should return a null matrix");

        test.done();
    },

    e(test) {
        test.expect(2);

        const m = new Mat3();

        // row 1, column 2
        m.e( 1 , 2 , 5 );

        test.equal( m.e( 1 , 2 ) , 5 , "write and access");

        let success = true;
        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
                if( r != 1 || c != 2 )
                    success = success && ( m.e( r , c ) == 0 );

        test.ok( success ,  "write should not touch the others elements");

        test.done();
    },

    identity(test) {
        test.expect(9);

        const m = new Mat3();

        m.identity();

        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
                test.equal( m.e( r , c ) , ( r == c ) ? 1 : 0 , `cellule ( row : ${r} column : ${c} )  should be ${c == r ? "1" : "0"}` );

        test.done();
    } ,

    vmult(test) {
        test.expect(1);

        const v = new Vec3( 2 , 3 , 7 );
        const m = new Mat3();

        /*
          set the matrix to
          | 1 2 3 |
          | 4 5 6 |
          | 7 8 9 |
        */
        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
                m.e( r , c , 1+r*3 + c );
        const t = m.vmult( v );

        test.ok( t.x == 29 && t.y == 65 && t.z == 101 ,  `Expected (29,65,101), got (${t.toString()}), while multiplying m=${m.toString()} with ${v.toString()}`);

        test.done();
    } ,

    mmult(test) {
        test.expect(1);

        const m1 = new Mat3();
        const m2 = new Mat3();



        /* set the matrix to
            | 1 2 3 |
            | 4 5 6 |
            | 7 8 9 |
        */
        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
                m1.e( r , c , 1+r*3 + c );


        /* set the matrix to
         | 5 2 4 |
         | 4 5 1 |
         | 1 8 0 |
        */
        m2.e( 0 , 0 , 5 );
        m2.e( 0 , 1 , 2 );
        m2.e( 0 , 2 , 4 );
        m2.e( 1 , 0 , 4 );
        m2.e( 1 , 1 , 5 );
        m2.e( 1 , 2 , 1 );
        m2.e( 2 , 0 , 1 );
        m2.e( 2 , 1 , 8 );
        m2.e( 2 , 2 , 0 );

        const m3 = m1.mmult( m2 );

        test.ok( m3.e( 0 , 0  ) == 16
             &&  m3.e( 0 , 1  ) == 36
             &&  m3.e( 0 , 2  ) == 6
             &&  m3.e( 1 , 0  ) == 46
             &&  m3.e( 1 , 1  ) == 81
             &&  m3.e( 1 , 2  ) == 21
             &&  m3.e( 2 , 0  ) == 76
             &&  m3.e( 2 , 1  ) == 126
             &&  m3.e( 2 , 2  ) == 36  ,  "calculating multiplication with another matrix");

        test.done();
    },

    solve(test) {

        test.expect(2);

        const m = new Mat3();
        const v = new Vec3( 2 , 3 , 7 );

        /* set the matrix to
        | 5 2 4 |
        | 4 5 1 |
        | 1 8 0 |
        */
        m.e( 0 , 0 , 5 );
        m.e( 0 , 1 , 2 );
        m.e( 0 , 2 , 4 );
        m.e( 1 , 0 , 4 );
        m.e( 1 , 1 , 5 );
        m.e( 1 , 2 , 1 );
        m.e( 2 , 0 , 1 );
        m.e( 2 , 1 , 8 );
        m.e( 2 , 2 , 0 );


        const t = m.solve( v );

        const vv = m.vmult( t );

        test.ok( vv.almostEquals( v , 0.00001 ) ,  "solving Ax = b");


        const m1 = new Mat3();

        /* set the matrix to
         | 1 2 3 |
         | 4 5 6 |
         | 7 8 9 |
         */
        for( let c = 0 ; c < 3 ; c ++ )
            for( let r = 0 ; r < 3 ; r ++ )
            m1.e( r , c , 1+r*3 + c );

        let error = false;

        try{
            m1.solve( v );
        }catch(e){
            error = true
        }

        test.ok( error ,  "should rise an error if the system has no solutions");

        test.done();

    },

    reverse(test) {

        test.expect(2);

        const m = new Mat3();

        /* set the matrix to
        | 5 2 4 |
        | 4 5 1 |
        | 1 8 0 |
        */
        m.e( 0 , 0 , 5 );
        m.e( 0 , 1 , 2 );
        m.e( 0 , 2 , 4 );
        m.e( 1 , 0 , 4 );
        m.e( 1 , 1 , 5 );
        m.e( 1 , 2 , 1 );
        m.e( 2 , 0 , 1 );
        m.e( 2 , 1 , 8 );
        m.e( 2 , 2 , 0 );


        const m2 = m.reverse();

        const m3 = m2.mmult( m );

        let success = true;
        for( var c = 0 ; c < 3 ; c ++ )
            for( var r = 0 ; r < 3 ; r ++ )
                success = success && ( Math.abs( m3.e( r , c ) - ( c == r ? 1 : 0 ) ) < 0.00001 );

        test.ok( success ,  "inversing");

        const m1 = new Mat3();

        /* set the matrix to
        | 1 2 3 |
        | 4 5 6 |
        | 7 8 9 |
        */
        for( var c = 0 ; c < 3 ; c ++ )
            for( var r = 0 ; r < 3 ; r ++ )
            m1.e( r , c , 1+r*3 + c );

        let error = false;

        try{
            m1.reverse();
        }catch(e){
            error = true
        }

        test.ok( error ,  "should rise an error if the matrix is not inersible");

        test.done();

    },

    transpose(test) {
        const M = new Mat3([  1,2,3,
                            4,5,6,
                            7,8,9  ]);
        const Mt = M.transpose();
        test.deepEqual(Mt.elements,[1,4,7,
                                    2,5,8,
                                    3,6,9]);
        test.done();
    },

    scale(test) {
        const M = new Mat3([  1,1,1,
                            1,1,1,
                            1,1,1  ]);
        const Mt = M.scale(new Vec3(1,2,3));
        test.deepEqual(Mt.elements,[1,2,3,
                                    1,2,3,
                                    1,2,3]);
        test.done();
    },

    setRotationFromQuaternion(test) {
        const M = new Mat3();
        const q = new Quaternion();
        const original = new Vec3(1,2,3);

        // Test zero rotation
        M.setRotationFromQuaternion(q);
        const v = M.vmult(original);
        test.ok(v.almostEquals(original));

        // Test rotation along x axis
        q.setFromEuler(0.222,0.123,1.234);
        M.setRotationFromQuaternion(q);
        Mv = M.vmult(original);
        qv = q.vmult(original);

        test.ok(Mv.almostEquals(qv));

        test.done();
    },
};
