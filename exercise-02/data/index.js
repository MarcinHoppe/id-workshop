const path = require('path');
const _ = require('lodash');
const Datastore = require('nedb');

const todosDb = new Datastore({
  filename: path.join(__dirname, 'todos.db'),
  autoload: true
});

const usersDb = new Datastore({
  filename: path.join(__dirname, 'users.db'),
  autoload: true
});

function add(user, todo, cb) {
  todosDb.findOne({ user }, (err, doc) => {
    if (err) {
      return cb(err);
    }

    if (!doc) {
      todosDb.insert({ user, nextId: 1, todos: [{ id: 0, todo, done: false }] }, (err) => {
        if (err) {
          return cb(err);
        }
        cb();
      });
    } else {
    todosDb.update({ _id: doc._id }, { $push: { todos: { id: doc.nextId, todo, done: false } }, $inc: { nextId: 1 } }, (err) => {
        if (err) {
          return cb(err);
        }
        cb();
      });
    }
  });
}

function all(user, cb) {
  todosDb.findOne({ user }, (err, doc) => {
    if (err) {
      return cb(err);
    }
    if (!doc) {
      return cb(null, []);
    }
    cb(null, doc.todos);
  });
}

function done(user, id, cb) {
  todosDb.findOne({ user }, (err, doc) => {
    if (err) {
      return cb(err);
    }
    if (!doc) {
      return cb(new Error(`Could not find todos for user ${user}`));
    }

    const todo = _.find(doc.todos, item => item.id === id);
    if (!todo) {
      return cb(new Error(`Could not find todo ${id} for user ${user}`));
    }

    todo.done = true;
    todosDb.update({ _id: doc._id }, { $set: { todos: doc.todos } }, (err) => {
      if (err) {
        return cb(err);
      }
      cb();
    });
  });
}

function remove(user, cb) {
  todosDb.remove({ user }, (err) => {
    if (err) {
      return cb(err);
    }
    cb();
  });
}

function store(user, cb) {
  usersDb.update({ user_id: user.user_id }, user, { upsert: true }, (err) => {
    if (err) {
      return cb(err);
    }
    cb();
  });
}

function user(user_id, cb) {
  usersDb.findOne({ user_id }, (err, doc) => {
    if (err) {
      return cb(err);
    }
    if (!doc) {
      return cb(null, false);
    }

    cb(null, doc);
  });
}

module.exports = {
  add,
  all,
  done,
  remove,
  store,
  user
};
