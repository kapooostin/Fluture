import chai from 'chai';
import {Future, or, of, reject, after} from '../index.mjs';
import * as U from './util';
import * as F from './futures';
import {testFunction, futureArg} from './props';

var expect = chai.expect;

describe('or()', function (){

  testFunction('or', or, [futureArg, futureArg], U.assertValidFuture);

  it('allows for the implementation of `any` in terms of reduce', function (){
    var any = function (ms){ return ms.reduce(or, reject('empty list')) };
    return Promise.all([
      U.assertRejected(any([]), 'empty list'),
      U.assertRejected(any([reject(1)]), 1),
      U.assertResolved(any([reject(1), of(2)]), 2),
      U.assertResolved(any([reject(1), after(20, 2), of(3)]), 2)
    ]);
  });

  describe('#_interpret()', function (){

    describe('(res, res)', function (){

      it('resolves with left if left resolves first', function (){
        return U.assertResolved(or(F.resolved, F.resolvedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', function (){
        return U.assertResolved(or(F.resolvedSlow, F.resolved), 'resolvedSlow');
      });

    });

    describe('(rej, rej)', function (){

      it('rejects with right if right rejects first', function (){
        return U.assertRejected(or(F.rejectedSlow, F.rejected), 'rejected');
      });

      it('rejects with right if right rejects last', function (){
        return U.assertRejected(or(F.rejected, F.rejectedSlow), 'rejectedSlow');
      });

    });

    describe('(rej, res)', function (){

      it('resolves with right if right resolves first', function (){
        return U.assertResolved(or(F.rejectedSlow, F.resolved), 'resolved');
      });

      it('resolves with right if right resolves last', function (){
        return U.assertResolved(or(F.rejected, F.resolvedSlow), 'resolvedSlow');
      });

    });

    describe('(res, rej)', function (){

      it('resolves with left if left resolves first', function (){
        return U.assertResolved(or(F.resolved, F.rejectedSlow), 'resolved');
      });

      it('resolves with left if left resolves last', function (){
        return U.assertResolved(or(F.resolvedSlow, F.rejected), 'resolvedSlow');
      });

    });

    it('cancels the running Future', function (done){
      var m = Future(function (){ return function (){ return done() } });
      var cancel = or(m, m)._interpret(done, U.noop, U.noop);
      cancel();
    });

  });

  describe('#toString()', function (){

    it('returns the code to create the data-structure', function (){
      var m = Future(function (){ return function (){} });
      var actual = or(m, m).toString();
      expect(actual).to.equal(((m.toString()) + '.or(' + (m.toString()) + ')'));
    });

  });

});