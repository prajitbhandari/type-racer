class AddField < ActiveRecord::Migration[5.2]
  def change
    remove_column :type_races, :start_time , :DateTime
    add_column :type_races, :start_time , :float
  end
end
