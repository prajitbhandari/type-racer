class AddCurrentUserToTypeRaces < ActiveRecord::Migration[5.2]
  def change
    add_column :type_races, :current_user_id, :integer
  end
end
