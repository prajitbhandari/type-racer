class AddFieldsToTable < ActiveRecord::Migration[5.2]
  def change
    add_column :type_races, :count, :integer
    add_column :type_races, :countdown, :integer
    add_column :type_races, :timer, :integer
    add_column :type_races, :get_minutes, :string
    add_column :type_races, :get_seconds, :string

  end
end
