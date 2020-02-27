class RemoveColumns < ActiveRecord::Migration[5.2]
  def change
    remove_column :type_races, :count, :integer
    remove_column :type_races, :timer, :integer
    remove_column :type_races, :get_minutes, :string
    remove_column :type_races, :get_seconds, :string
  end
end
