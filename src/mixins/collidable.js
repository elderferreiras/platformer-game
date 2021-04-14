export default {
  addCollider(collider, callback) {
    this.scene.physics.add.collider(this, collider, callback, null, this);
    return this;
  }
}
