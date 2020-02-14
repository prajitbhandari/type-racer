class DropJoinTable < ActiveRecord::Migration[5.2]
  def change
    drop_join_table :type_races, :users
  end
end
